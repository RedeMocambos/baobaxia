-- Simulation of non-flood syncing of content, across a network of nodes.

module Main where

import System.Random
import Control.Monad.Random
import Control.Monad
import Control.Applicative
import Data.Ratio
import Data.Ord
import Data.List
import Data.Maybe
import qualified Data.Set as S
import qualified Data.Map.Strict as M

{-
 - Tunable values
 -}

totalFiles :: Int
totalFiles = 100

-- How likely is a given file to be wanted by any particular node?
probabilityFilesWanted :: Probability
probabilityFilesWanted = 0.10

-- How many different locations can each transfer node move between?
-- (Min, Max)
transferDestinationsRange :: (Int, Int)
transferDestinationsRange = (2, 3)

-- Controls how likely transfer nodes are to move around in a given step
-- of the simulation.
-- (They actually move slightly less because they may start to move and
-- pick the same location they are at.)
-- (Min, Max)
transferMoveFrequencyRange :: (Probability, Probability)
transferMoveFrequencyRange = (0.10, 1.00)

-- counts both immobile and transfer nodes as hops, so double Vince's
-- theoretical TTL of 3.
-- (30% loss on mocambos network w/o ttl of 4!)
maxTTL :: TTL
maxTTL = TTL (4 * 2)

numImmobileNodes :: Int
numImmobileNodes = 10

numTransferNodes :: Int
numTransferNodes = 20

numSteps :: Int
numSteps = 100

-- IO code
main :: IO ()
main = do
--   initialnetwork <- evalRandIO (seedFiles totalFiles =<< genNetwork)
     initialnetwork <- evalRandIO (seedFiles totalFiles =<< mocambosNetwork)
     networks <- evalRandIO (simulate numSteps initialnetwork)
     let finalnetwork = last networks
     putStrLn $ summarize initialnetwork finalnetwork
     putStrLn "location history of file 1:"
     print $ trace (traceHaveFile (File 1)) networks
     putStrLn "request history of file 1:"
     print $ trace (traceWantFile (File 1)) networks
-- Only pure code below :)

data Network = Network (M.Map NodeName ImmobileNode) [TransferNode]
     deriving (Show, Eq)

data ImmobileNode = ImmobileNode NodeRepo
     deriving (Show, Eq)

type NodeName = String

type Route = [NodeName]

data TransferNode = TransferNode
     { currentlocation :: NodeName
     , possiblelocations :: [NodeName]
     , movefrequency :: Probability
     , transferrepo :: NodeRepo
     }
     deriving (Show, Eq)

data NodeRepo = NodeRepo
     { wantFiles :: [Request]
     , haveFiles :: S.Set File
     , satisfiedRequests :: S.Set Request
     }
     deriving (Show, Eq)

data File = File Int
     deriving (Show, Eq, Ord)

randomFile :: (RandomGen g) => Rand g File
randomFile = File <$> getRandomR (0, totalFiles)

data Request = Request File TTL
     deriving (Show, Ord)

-- compare ignoring TTL
instance Eq Request where
	 (Request f1 _) == (Request f2 _) = f1 == f2

requestedFile :: Request -> File
requestedFile (Request f _) = f

requestTTL :: Request -> TTL
requestTTL (Request _ ttl) = ttl

data TTL = TTL Int
     deriving (Show, Eq, Ord)

incTTL :: TTL -> TTL
incTTL (TTL t) = TTL (t + 1)

decTTL :: TTL -> TTL
decTTL (TTL t) = TTL (t - 1)

staleTTL :: TTL -> Bool
staleTTL (TTL t) = t < 1

-- Origin of a request starts one higher than max, since the TTL
-- will decrement the first time the Request is transferred to another node.
originTTL :: TTL
originTTL = incTTL maxTTL

randomRequest :: (RandomGen g) => Rand g Request
randomRequest = Request
	      <$> randomFile
	      <*> pure originTTL

type Probability = Float

randomProbability :: (RandomGen g) => Rand g Probability
randomProbability = getRandomR (0, 1)

-- Returns the state of the network at each step of the simulation.
simulate :: (RandomGen g) => Int -> Network -> Rand g [Network]
simulate n net = go n [net]
  where
  go 0 nets = return (reverse nets)
  go c (prev:nets) = do
     new <- step prev
     	 go (c - 1) (new:prev:nets)

-- Each step of the simulation, check if each TransferNode wants to move,
-- and if so:
--   1. It and its current location exchange their Requests.
--   2. And they exchange any requested files.
--   3. Move it to a new random location.
--
-- Note: This implementation does not exchange requests between two
-- TransferNodes that both arrive at the same location at the same step,
-- and then move away in the next step.
step :: (RandomGen g) => Network -> Rand g Network
step (Network immobiles transfers) = go immobiles [] transfers
  where
  go is c [] = return (Network is c)
  go is c (t:ts) = do
     r <- randomProbability
       if movefrequency t <= r
       	  then case M.lookup (currentlocation t) is of
	    Nothing -> go is (c ++ [t]) ts
	     Just currentloc -> do
	      let (currentloc', t') = merge currentloc t
	       	t'' <- move t'
		    go (M.insert (currentlocation t) currentloc' is) (c ++ [t'']) ts
       else go is (c ++ [t]) ts

merge :: ImmobileNode -> TransferNode -> (ImmobileNode, TransferNode)
merge (ImmobileNode ir) t@(TransferNode { transferrepo = tr }) =
      ( ImmobileNode (go ir tr)
      , t { transferrepo = go tr ir }
      )
  where
  go r1 r2 = r1
     { wantFiles = wantFiles'
       , haveFiles = haveFiles'
       	 , satisfiedRequests = satisfiedRequests' `S.union` checkSatisfied wantFiles' haveFiles'
	   }
	     where
		wantFiles' = foldr addRequest (wantFiles r1) (wantFiles r2)
			   haveFiles' = S.foldr (addFile wantFiles' satisfiedRequests') (haveFiles r1) (haveFiles r2)
			   	      satisfiedRequests' = satisfiedRequests r1 `S.union` satisfiedRequests r2

-- Adds a file to the set, when there's a request for it, and the request
-- has not already been satisfied.
addFile :: [Request] -> S.Set Request -> File -> S.Set File -> S.Set File
addFile rs srs f fs
	| any (\sr -> f == requestedFile sr) (S.toList srs) = fs
	| any (\r -> f == requestedFile r) rs = S.insert f fs
	| otherwise = fs

-- Checks if any requests have been satisfied, and returns them,
-- to be added to satisfidRequests
checkSatisfied :: [Request] -> S.Set File -> S.Set Request
checkSatisfied want have = S.fromList (filter satisfied want)
  where
  satisfied r = requestTTL r == originTTL && S.member (requestedFile r) have

-- Decrements TTL, and avoids adding request with a stale TTL, or a
-- request for an already added file with the same or a lower TTL.
addRequest :: Request -> [Request] -> [Request]
addRequest (Request f ttl) rs
	   | staleTTL ttl' = rs
	   | any (\r -> requestTTL r >= ttl) similar = rs
	   | otherwise = r' : other
  where
  ttl' = decTTL ttl
  r' = Request f ttl'
  (other, similar) = partition (/= r') rs

move :: (RandomGen g) => TransferNode -> Rand g TransferNode
move t = do
     newloc <- randomfrom (possiblelocations t)
     return $ t { currentlocation = newloc }

genNetwork :: (RandomGen g) => Rand g Network
genNetwork = do
	   let immobiles = M.fromList (zip (map show [1..]) (replicate numImmobileNodes emptyImmobile))
	   transfers <- sequence (replicate numTransferNodes (mkTransfer $ M.keys immobiles))
	   return $ Network immobiles transfers

emptyImmobile :: ImmobileNode
emptyImmobile = ImmobileNode (NodeRepo [] S.empty S.empty)

mkTransfer :: (RandomGen g) => [NodeName] -> Rand g TransferNode
mkTransfer immobiles = do
  	   -- Transfer nodes are given random routes. May be simplistic.
	   -- Also, some immobile nodes will not be serviced by any transfer nodes.
	   numpossiblelocs <- getRandomR transferDestinationsRange
	   possiblelocs <- sequence (replicate numpossiblelocs (randomfrom immobiles))
	   mkTransferBetween possiblelocs

mkTransferBetween :: (RandomGen g) => [NodeName] -> Rand g TransferNode
mkTransferBetween possiblelocs = do
		  currentloc <- randomfrom possiblelocs
		  movefreq <- getRandomR transferMoveFrequencyRange
		  -- transfer nodes start out with no files or requests in their repo
		  let repo = (NodeRepo [] S.empty S.empty)
		  return $ TransferNode currentloc possiblelocs movefreq repo

randomfrom :: (RandomGen g) => [a] -> Rand g a
randomfrom l = do
	   i <- getRandomR (1, length l)
	   return $ l !! (i - 1)

-- Seeds the network with the given number of files. Each file is added to
-- one of the immobile nodes of the network at random. And, one other node,
-- at random, is selected which wants to get the file.
seedFiles :: (RandomGen g) => Int -> Network -> Rand g Network
seedFiles 0 network = return network
seedFiles n network@(Network m t) = do
	  (origink, ImmobileNode originr) <- randnode
	  (destinationk, ImmobileNode destinationr) <- randnode
	  let file = File n
	  let origin = ImmobileNode $ originr
	      { haveFiles = S.insert file (haveFiles originr) }
	      let destination = ImmobileNode $ destinationr
	      	  { wantFiles = Request file originTTL : wantFiles destinationr }
		  let m' = M.insert origink origin $
		      M.insert destinationk destination m
		      seedFiles (n - 1) (Network m' t)
  where
  randnode = do
  	   k <- randomfrom (M.keys m)
	     return (k, fromJust $ M.lookup k m)

summarize :: Network -> Network -> String
summarize _initial@(Network origis _) _final@(Network is _ts) = format
	  [ ("Total wanted files",
	    show (sum (overis (length . findoriginreqs . wantFiles . repo))))
	    , ("Wanted files that were not transferred to requesting node",
	      show (sum (overis (S.size . findunsatisfied . repo))))
	      , ("Nodes that failed to get files",
	      	show (map withinitiallocs $ filter (not . S.null . snd)
		     	  (M.toList $ M.map (findunsatisfied . repo) is)))
			  , ("Total number of files on immobile nodes at end",
			    show (overis (S.size . haveFiles . repo)))
			    --, ("Immobile nodes at end", show is)
			    ]
  where
	findoriginreqs = filter (\r -> requestTTL r == originTTL)
	findunsatisfied r = 
			let wantedfs = S.fromList $ map requestedFile (findoriginreqs (wantFiles r))
			    in S.difference wantedfs (haveFiles r)
			    repo (ImmobileNode r) = r
			    overis f = map f $ M.elems is
			    format = unlines . map (\(d, s) -> d ++ ": " ++ s)

			    withinitiallocs (name, missingfiles) = (name, S.map addinitialloc missingfiles)
			    addinitialloc f = (f, M.lookup f initiallocs)

			    initiallocs = M.fromList $ 
			    		concatMap (\(k, v) -> map (\f -> (f, k)) (S.toList $ haveFiles $ repo v)) $
						  	M.toList origis

trace :: (Network -> S.Set NodeName) -> [Network] -> String
trace tracer networks = show $ go [] S.empty $ map tracer networks
  where
  go c old [] = reverse c
  go c old (new:l) = go ((S.toList $ new `S.difference` old):c) new l

traceHaveFile :: File -> Network -> S.Set NodeName
traceHaveFile f (Network m _) = S.fromList $ M.keys $
	      M.filter (\(ImmobileNode r) -> f `S.member` haveFiles r) m 

traceWantFile :: File -> Network -> S.Set NodeName
traceWantFile f (Network m _) = S.fromList $ M.keys $
	      M.filter (\(ImmobileNode r) -> any wantf (wantFiles r)) m 
  where
  wantf (Request rf _ttl) = rf == f

mocambosNetwork :: (RandomGen g) => Rand g Network
mocambosNetwork = do
		let major = map (immobilenamed . fst) communities
		let minor = map immobilenamed (concatMap snd communities)
		majortransfer <- mapM mkTransferBetween majorroutes
		minortransfer <- mapM mkTransferBetween (concatMap minorroutes (concat (replicate 5 communities)))
		return $ Network
		       (M.fromList (major++minor))
		       		   (majortransfer ++ minortransfer)
  where
  immobilenamed name = (name, emptyImmobile)

  -- As a simplification, this only makes 2 hop routes, between minor
  -- and major communities; no 3-legged routes.
  minorroutes :: (NodeName, [NodeName]) -> [Route]
  minorroutes (major, minors) = map (\n -> [major, n]) minors

communities :: [(NodeName, [NodeName])]
communities =
	    [ ("Taina/SP",
	      [ "brotas"
	      	, "vauedo ribera"
		  , "cofundo"
		    , "jao"
		      , "fazenda"
		      	]
			  )
			  , ("Odomode/RS",
			    [ "moradadapaz"
			      , "pelotas" 
			      	]
				  )
				  , ("MercadoSul/DF",
				    [ "mesquito"
				      , "kalungos"
				      	]
					  )
					  , ("Coco/PE",
					    [ "xamba"
					      , "alafin"
					      	, "terreiros"
						  ]
						    )
						    , ("Linharinho/ES",
						      [ "monte alegne"
						      	]
							  )
							  , ("Boneco/BA",
							    [ "barroso"
							      , "lagoa santa"
							      	, "terravista"
								  ]
								    )
								    , ("Zumbidospalmanes/NA",
								      [ "allantana"
								      	]
									  )
									  , ("Casa Pneta/PA",
									    [ "marajo"
									      ]
									        )
										, ("Purarue/PA",
										  [ "oriamina"
										    ]
										      )
										      , ("Madiba/NET", [])
										      ]

majorroutes :: [Route]
majorroutes =
	    -- person's routes
	    [ ["Taina/SP", "Odomode/RS"]
	    , ["Taina/SP", "MercadoSul/DF"]
	    , ["MercadoSul/DF", "Boneco/BA"]
	    , ["MercadoSul/DF", "Zumbidospalmanes/NA"]
	    , ["Zumbidospalmanes/NA", "Casa Pneta/PA"]
	    , ["Casa Preta/PA", "Puraque/PA"]
	    , ["Casa Preta/PA", "Linharinho/ES"]
	    , ["Boneco/BA", "Coco/PE"]
	    -- internet connections
	    , ["Taina/SP", "MercadoSul/DF", "Coco/PE", "Puraque/PA", "Odomode/RS", "Madiba/NET"]
	    , ["Taina/SP", "MercadoSul/DF", "Coco/PE", "Puraque/PA", "Odomode/RS", "Madiba/NET"]
	    , ["Taina/SP", "MercadoSul/DF", "Coco/PE", "Puraque/PA", "Odomode/RS", "Madiba/NET"]
	    , ["Taina/SP", "MercadoSul/DF", "Coco/PE", "Puraque/PA", "Odomode/RS", "Madiba/NET"]
	    , ["Taina/SP", "MercadoSul/DF", "Coco/PE", "Puraque/PA", "Odomode/RS", "Madiba/NET"]
	    ]