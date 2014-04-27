all: lint dist

deps:
	npm install -g jshint
    
lint:
	jshint *.js
    
dist: README.md\
	LICENSE\
	extension.js\
	metadata.json
	zip -j remove-dropdown-arrows@mpdeimos.com.zip $?

clean:
	 rm -f *.zip
