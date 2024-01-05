dev-build:
	PRODUCTION=true ./mkcss # always minimize
	BACKEND=1 rollup -c
	date
	cp -r app/assets/* public
	pushd public && python3 -m http.server 3333
	popd

dependency-graph:
	./node_modules/madge/bin/cli.js --image modules.svg app
	open -a "Firefox" modules.svg

update-fonts:
	unzip -j -d app/assets/fonts ~/Downloads/icomoon.zip 'fonts/*'
	mv app/assets/fonts/icomoon.ttf app/assets/fonts/sbg-resources.ttf
	mv app/assets/fonts/icomoon.woff app/assets/fonts/sbg-resources.woff
	mv app/assets/fonts/icomoon.eot app/assets/fonts/sbg-resources.eot
	mv app/assets/fonts/icomoon.svg app/assets/fonts/sbg-resources.svg
	mv ~/Downloads/icomoon.zip ~/Downloads/icomoon.zip.bak

production-build:
	PRODUCTION=true ./mkcss
	BACKEND=0 rollup -c
	cp -r app/assets/* public
	date
