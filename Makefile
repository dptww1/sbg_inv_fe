DEV_GLOBALS_URL  = http:\/\/localhost:4000\/js\/globals
PROD_GLOBALS_URL = https:\/\/homely-uncomfortable-wreckfish.gigalixirapp.com\/js\/globals
DATE             = $(shell date -Idate)

dev-build:
	@PRODUCTION=true ./mkcss # always minimize
	@BACKEND=1 rollup -c
	@date
	@cp -r app/assets/* public
	@sed -e 's/GLOBALS_URL/$(DEV_GLOBALS_URL)/' app/assets/index.html >public/index.html
	@pushd public && python3 -m http.server 3333
	@popd

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

production-build: lint
	@PRODUCTION=true ./mkcss
	@BACKEND=0 rollup -c
	@cp -r app/assets/* public
	@sed -e 's/GLOBALS_URL/$(PROD_GLOBALS_URL)/' app/assets/index.html | sed 's/RELEASE_DATE/$(DATE)/' >public/index.html
	@date
	@echo Ready for deployment

lint:
	npx eslint --c eslint.config.js app
