filename=Relatorio_BBX

all: pdf read

edit:
	emacs ${filename}.tex

pdf: 
	pdflatex ${filename}.tex

remake: pdf bibtex pdf

bibtex:
	bibtex ${filename}.aux

read:
	evince ${filename}.pdf &

aread:
	acroread ${filename}.pdf &

clean:
	rm -f ${filename}.lof ${filename}.toc ${filename}.lot ${filename}.pdf ${filename}.log ${filename}.aux ${filename}.out ${filename}.dvi ${filename}.bbl ${filename}.blg ${filename}.*~ *~

getsubmodule:
	git submodule update --init --recursive
	git submodule foreach 'git pull origin master'
