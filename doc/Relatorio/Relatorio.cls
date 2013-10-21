%%
%% Questo è il file `Tesi.cls', basato su 'ECSthesis.cls', di Steve R. Gunn
%% creato con docstrip utility, modificato da Sunil Patel e da Vincenzo Tozzi.
%%

\usepackage[utf8]{inputenc}

\NeedsTeXFormat{LaTeX2e}[1996/12/01]
\ProvidesClass{Tesi}
              [2007/22/02 v1.0
   LaTeX document class]
\def\baseclass{book}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{\baseclass}}
\def\@checkoptions#1#2{
  \edef\@curroptions{\@ptionlist{\@currname.\@currext}}
  \@tempswafalse
  \@tfor\@this:=#2\do{
    \@expandtwoargs\in@{,\@this,}{,\@curroptions,}
    \ifin@ \@tempswatrue \@break@tfor \fi}
  \let\@this\@empty
  \if@tempswa \else \PassOptionsToClass{#1}{\baseclass}\fi
}
\@checkoptions{11pt}{{10pt}{11pt}{12pt}}
\PassOptionsToClass{a4paper}{\baseclass}
\ProcessOptions\relax
\LoadClass{\baseclass}
\newcommand\bhrule{\typeout{------------------------------------------------------------------------------}}

\newcommand\Declaration[1]{
\btypeout{Dichiarazione di paternità}
\addtotoc{Dichiarazione di paternità}
\thispagestyle{plain}
\null\vfil
%\vskip 60\p@
\begin{center}{\huge\bf Dichiarazione di paternità\par}\end{center}
%\vskip 60\p@
{\normalsize #1}
\vfil\vfil\null
%\cleardoublepage
}

\newcommand\btypeout[1]{\bhrule\typeout{\space #1}\bhrule}
\def\today{\ifcase\month\or
  Gennaio\or Febbraio\or Marzo\or Aprile\or Maggio\or Giugno\or
  Luglio\or Agosto\or Settembre\or Ottobbre\or Novembre\or Dicembre\fi
  \space \number\year}
\usepackage{setspace}
\onehalfspacing
\setlength{\parindent}{0pt}
\setlength{\parskip}{2.0ex plus0.5ex minus0.2ex}
\usepackage{vmargin}
\setmarginsrb           { 1.5in}  % left margin
                        { 0.6in}  % top margin
                        { 1.0in}  % right margin
                        { 0.8in}  % bottom margin
                        {  20pt}  % head height
                        {0.25in}  % head sep
                        {   9pt}  % foot height
                        { 0.3in}  % foot sep
\raggedbottom
\setlength{\topskip}{1\topskip \@plus 5\p@}
\doublehyphendemerits=10000       % No consecutive line hyphens.
\brokenpenalty=10000              % No broken words across columns/pages.
\widowpenalty=9999                % Almost no widows at bottom of page.
\clubpenalty=9999                 % Almost no orphans at top of page.
\interfootnotelinepenalty=9999    % Almost never break footnotes.
\usepackage{fancyhdr}
\lhead[\rm\thepage]{\fancyplain{}{\sl{\rightmark}}}
\rhead[\fancyplain{}{\sl{\leftmark}}]{\rm\thepage}
\chead{}\lfoot{}\rfoot{}\cfoot{}
\pagestyle{fancy}
\renewcommand{\chaptermark}[1]{\btypeout{\thechapter\space #1}\markboth{\@chapapp\ \thechapter\ #1}{\@chapapp\ \thechapter\ #1}}
\renewcommand{\sectionmark}[1]{}
\renewcommand{\subsectionmark}[1]{}
\def\cleardoublepage{\clearpage\if@twoside \ifodd\c@page\else
\hbox{}
\thispagestyle{empty}
\newpage
\if@twocolumn\hbox{}\newpage\fi\fi\fi}
\usepackage{amsmath,amsfonts,amssymb,amscd,amsthm,xspace}
\theoremstyle{plain}
\newtheorem{example}{Example}[chapter]
\newtheorem{theorem}{Theorem}[chapter]
\newtheorem{corollary}[theorem]{Corollary}
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{axiom}[theorem]{Axiom}
\theoremstyle{definition}
\newtheorem{definition}[theorem]{Definition}
\theoremstyle{remark}
\newtheorem{remark}[theorem]{Remark}
\usepackage[centerlast,small,sc]{caption}
\setlength{\captionmargin}{20pt}
\newcommand{\fref}[1]{Figure~\ref{#1}}
\newcommand{\tref}[1]{Table~\ref{#1}}
\newcommand{\eref}[1]{Equation~\ref{#1}}
\newcommand{\cref}[1]{Chapter~\ref{#1}}
\newcommand{\sref}[1]{Section~\ref{#1}}
\newcommand{\aref}[1]{Appendix~\ref{#1}}
\renewcommand{\topfraction}{0.85}
\renewcommand{\bottomfraction}{.85}
\renewcommand{\textfraction}{0.1}
\renewcommand{\dbltopfraction}{.85}
\renewcommand{\floatpagefraction}{0.75}
\renewcommand{\dblfloatpagefraction}{.75}
\setcounter{topnumber}{9}
\setcounter{bottomnumber}{9}
\setcounter{totalnumber}{20}
\setcounter{dbltopnumber}{9}
\usepackage{graphicx}
\usepackage{epstopdf}
\usepackage[scriptsize]{subfigure}
\usepackage{booktabs}
\usepackage{rotating}
\usepackage{listings}
%\usepackage{lstpatch}
\lstset{captionpos=b,
        frame=tb,
        basicstyle=\scriptsize\ttfamily,
        showstringspaces=false,
        keepspaces=true}
\lstdefinestyle{matlab} {
        language=Matlab,
        keywordstyle=\color{blue},
        commentstyle=\color[rgb]{0.13,0.55,0.13}\em,
        stringstyle=\color[rgb]{0.7,0,0} }
\usepackage[pdfpagemode={UseOutlines},bookmarks=true,bookmarksopen=true,
   bookmarksopenlevel=0,bookmarksnumbered=true,hypertexnames=false,
   colorlinks,linkcolor={blue},citecolor={blue},urlcolor={red},
   pdfstartview={FitV},unicode,breaklinks=true]{hyperref}
\pdfstringdefDisableCommands{
   \let\\\space
}
\newcommand*{\supervisor}[1]{\def\supname{#1}}
\newcommand*{\examiner}[1]{\def\examname{#1}}
\newcommand*{\degree}[1]{\def\degreename{#1}}
\newcommand*{\authors}[1]{\def\authornames{#1}}
\newcommand*{\addresses}[1]{\def\addressnames{#1}}
\newcommand*{\redemocambos}[1]{\def\redemocambos{#1}}
\newcommand*{\REDEMOCAMBOS}[1]{\def\REDEMOCAMBOS{#1}}
\newcommand*{\npdd}[1]{\def\npdd{#1}}
\newcommand*{\NPDD}[1]{\def\NPDD{#1}}
\newcommand*{\taina}[1]{\def\taina{#1}}
\newcommand*{\TAINA}[1]{\def\TAINA{#1}}
\newcommand*{\fbb}[1]{\def\fbb{#1}}
\newcommand*{\FBB}[1]{\def\FBB{#1}}
\newcommand*{\subject}[1]{\def\subjectname{#1}}
\newcommand*{\keywords}[1]{\def\keywordnames{#1}}
\supervisor  {Dott. Alberto Mancini}
\examiner    {Prof. Rocco de Nicola}
\degree      {Corso di Laurea in Informatica}
\authors     {Vincenzo Tozzi}
\redemocambos  {\texorpdfstring{\href{http://www.mocambos.net}
                {Rede Mocambos}}
                {Rede Mocambos}}
\REDEMOCAMBOS  {\texorpdfstring{\href{http://www.mocambos.net}
                {REDE MOCAMBOS}}
                {REDE MOCAMBOS}}
\fbb  {\texorpdfstring{\href{http://www.fbb.org.br}
                {Fundação Banco do Brasil}}
                {Fundação Banco do Brasil}}
\FBB  {\texorpdfstring{\href{http://www.fbb.org.br}
                {FUNDAÇÃO BANCO DO BRASIL}}
                {FUNDAÇÃO BANCO DO BRASIL}}
\npdd       {\texorpdfstring{\href{http://wiki.mocambos.net/wiki/NPDD}
                {Núcleo de Pesquisa e Desenvolvimento Digital}}
                {Núcleo de Pesquisa e Desenvolvimento Digital}}
\NPDD       {\texorpdfstring{\href{http://wiki.mocambos.net/wiki/NPDD}
                {NÚCLEO DE PESQUISA E DESENVOLVIMENTO DIGITAL}}
                {NÚCLEO DE PESQUISA E DESENVOLVIMENTO DIGITAL}}
\taina     {\texorpdfstring{\href{http://www.taina.org}
                {Casa de Cultura Tainã}}
                {Casa de Cultura Tainã}}
\TAINA     {\texorpdfstring{\href{http://www.taina.org}
                {CASA DE CULTURA TAINÃ}}
                {CASA DE CULTURA TAINÃ}}
\addresses   {}
\subject     {}
\keywords    {}
\renewcommand\maketitle{
  \btypeout{Title Page}
  \hypersetup{pdftitle={\@title}}
  \hypersetup{pdfsubject=\subjectname}
  \hypersetup{pdfauthor=\authornames}
  \hypersetup{pdfkeywords=\keywordnames}
  \thispagestyle{empty}
  \begin{titlepage}
    \let\footnotesize\small
    \let\footnoterule\relax
    \let \footnote \thanks
    \setcounter{footnote}{0}
    \null\vfill
    \vskip 10\p@
      \begin{center}
      {\LARGE\textbf{\REDEMOCAMBOS}\par}
      \begin{figure}[htbp]
        \centering
%        \includegraphics[width=3.5cm]{./Figure/LogoUNIFI.pdf}
      \end{figure}
      {\large \NPDD \par}     
%      {\large Taguatinga \par}     

      \setlength{\parskip}{0pt}
      \vfill
      \vfill
      \vfill
      {\huge \bf \@title \par}
      {\huge na Rota dos Baobás \par}
      \vfill
      %% {\LARGE por \par}
      \smallskip
      {\LARGE Versão 0.2 \par}
      {\small Consultoria da Gunga \par}
      {\small Nota fiscal XXXX de 10/2013 \par}
      %% \vfill
      \vfill
      {\large Parceria\par}
      {\large \fbb \par}
      \bigskip
      \bigskip
%      {\large presso \par}

%      {\large \deptname \par}
      \par
    \end{center}

      %% \begin{minipage}{0.5\textwidth}
      %%   \begin{flushleft} \large
      %%     {\large Coordenador \redemocambos: \par}
      %%     {\large Antonio Carlos Santos Silva - TC \par}
      %%   \end{flushleft}
      %% \end{minipage}
      %% \begin{minipage}{0.5\textwidth}
      %%   \begin{flushright} \large
      %%     {\large Coordenador \npdd: \par}
      %%     {\large Vincenzo Tozzi \par}
      %%   \end{flushright}
      %% \end{minipage}


      \begin{center}
      \bigskip
%      {\Large \@date \par}
      {\Large \TAINA \par}
      \bigskip
    \end{center}

    \par
    \@thanks
    \vfil\null
  \end{titlepage}
  \setcounter{footnote}{0}%
  \global\let\thanks\relax
  \global\let\maketitle\relax
  \global\let\@thanks\@empty
  \global\let\@author\@empty
  \global\let\@date\@empty
  \global\let\@title\@empty
  \global\let\title\relax
  \global\let\author\relax
  \global\let\date\relax
  \global\let\and\relax
  \cleardoublepage
}
\newenvironment{abstract}
{
  \btypeout{Abstract Page}
  \thispagestyle{empty}
  \null\vfil
  \begin{center}
    \setlength{\parskip}{0pt}
    {\normalsize \REDEMOCAMBOS \par}
    {\normalsize \npdd \par}
    {\normalsize \taina \par}
    \bigskip
    {\huge{\textit{Resumo}} \par}
    \bigskip

%    {\normalsize \deptname \par}
    %% \bigskip
    %% {\normalsize Corso di Laurea in Informatica\par}
    %% \bigskip
    %% % {\normalsize\bf \@title \par}
    %% {\normalsize\bf Eventually connected federated network \par}
    %% {\normalsize Architecture and prototype for Mocambos Network \par}
    % \vfill
    \medskip
%%    {\normalsize by \authornames \par}
    \bigskip
  \end{center}
}
{
  \vfil\vfil\vfil\null
  \cleardoublepage
}
\addtocounter{secnumdepth}{1}
\setcounter{tocdepth}{6}
\newcounter{dummy}
\newcommand\addtotoc[1]{
\refstepcounter{dummy}
\addcontentsline{toc}{chapter}{#1}}
\renewcommand\tableofcontents{
\btypeout{Table of Contents}
\begin{spacing}{1}{
    \setlength{\parskip}{1pt}
    \if@twocolumn
      \@restonecoltrue\onecolumn
    \else
      \@restonecolfalse
    \fi
    \chapter*{\contentsname
        \@mkboth{
           \MakeUppercase\contentsname}{\MakeUppercase\contentsname}}
    \@starttoc{toc}
    \if@restonecol\twocolumn\fi
   \cleardoublepage
}\end{spacing}
}
\renewcommand\listoffigures{
\btypeout{Elenco delle figure}
\addtotoc{Elenco delle figure}
\begin{spacing}{1}{
    \setlength{\parskip}{1pt}
    \if@twocolumn
      \@restonecoltrue\onecolumn
    \else
      \@restonecolfalse
    \fi
    \chapter*{\listfigurename
      \@mkboth{\MakeUppercase\listfigurename}
              {\MakeUppercase\listfigurename}}
    \@starttoc{lof}
    \if@restonecol\twocolumn\fi
    \cleardoublepage
}\end{spacing}
}
\renewcommand\listoftables{
\btypeout{List of Tables}
\addtotoc{List of Tables}
\begin{spacing}{1}{
    \setlength{\parskip}{1pt}
    \if@twocolumn
      \@restonecoltrue\onecolumn
    \else
      \@restonecolfalse
    \fi
    \chapter*{\listtablename
      \@mkboth{
          \MakeUppercase\listtablename}{\MakeUppercase\listtablename}}
    \@starttoc{lot}
    \if@restonecol\twocolumn\fi
    \cleardoublepage
}\end{spacing}
}
\newcommand\listsymbolname{Acrónimos}
\usepackage{longtable}
\newcommand\listofsymbols[2]{
\btypeout{\listsymbolname}
\addtotoc{\listsymbolname}
    \chapter*{\listsymbolname
      \@mkboth{
          \MakeUppercase\listsymbolname}{\MakeUppercase\listsymbolname}}
\begin{longtable}[c]{#1}#2\end{longtable}\par
    \cleardoublepage
}
\newcommand\listconstants{Physical Constants}
\usepackage{longtable}
\newcommand\listofconstants[2]{
\btypeout{\listconstants}
\addtotoc{\listconstants}
    \chapter*{\listconstants
      \@mkboth{
          \MakeUppercase\listconstants}{\MakeUppercase\listconstants}}
\begin{longtable}[c]{#1}#2\end{longtable}\par
    \cleardoublepage
}
\newcommand\listnomenclature{Symbols}
\usepackage{longtable}
\newcommand\listofnomenclature[2]{
\btypeout{\listnomenclature}
\addtotoc{\listnomenclature}
    \chapter*{\listnomenclature
      \@mkboth{
          \MakeUppercase\listnomenclature}{\MakeUppercase\listnomenclature}}
\begin{longtable}[c]{#1}#2\end{longtable}\par
    \cleardoublepage
}
\newcommand\acknowledgements[1]{
\btypeout{Ringraziamenti}
\addtotoc{Agradecimentos}
\thispagestyle{plain}
\begin{center}{\huge{\textit{Agradecimentos}} \par}\end{center}
{\normalsize #1}
\vfil\vfil\null

}
\newcommand\dedicatory[1]{
\btypeout{Dedicatoria}
\thispagestyle{plain}
\null\vfil
\vskip 60\p@
\begin{center}{\Large \sl #1}\end{center}
\vfil\null
\cleardoublepage
}
\renewcommand\backmatter{
  \if@openright
    \cleardoublepage
  \else
    \clearpage
  \fi
  \addtotoc{\bibname}
  \btypeout{\bibname}
  \@mainmatterfalse}
\endinput
%%
%% End of file `Tesi.cls'.
