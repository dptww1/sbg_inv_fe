watch:
	brunch watch --server

dependency-graph:
	madge --image modules.svg app
	open -a "Google Chrome" modules.svg

update-fonts:
	unzip -j -d app/assets/fonts ~/Downloads/icomoon.zip 'fonts/*'
	mv app/assets/fonts/icomoon.ttf app/assets/fonts/sbg-resources.ttf
	mv app/assets/fonts/icomoon.woff app/assets/fonts/sbg-resources.woff
	mv app/assets/fonts/icomoon.eot app/assets/fonts/sbg-resources.eot
	mv app/assets/fonts/icomoon.svg app/assets/fonts/sbg-resources.svg

production-build:
	brunch build --production
