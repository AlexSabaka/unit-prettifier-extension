####################################
# Build command for Chrome Extension
####################################

ch = chromium

.PHONY: help build

help:
	$(info ${HELP_MESSAGE})
	@exit 0

build:
	@echo 'Preparing new extension build..' 
	@export INLINE_RUNTIME_CHUNK=false; \
	export GENERATE_SOURCEMAP=false; \
	yarn build
	@mkdir -p dist
	@cp -r build/* dist
	@echo 'Renaming files...' 
	@mv dist/index.html dist/popup.html
	@exit 0

pack:
	@echo 'Packing extension...'

	@$(ch) --pack-extension=./dist
	@echo 'Renaming packed extension & private key file...'
	@mv ./dist.crx ./UnitPrettifier.crx
	@mv ./dist.pem ./UnitPrettifier.pem
	@echo 'Done'
	@exit 0

clean:
	@echo 'Cleaning...'
	@rm -rf dist/*
	@rm -rf build/*
	@rmdir dist
	@rmdir build
	@rm -f UnitPrettifier.crx
	@rm -f UnitPrettifier.pem
	@echo 'Prior build cleaned!'
	@exit 0

define HELP_MESSAGE

	--- Run this command to make ready to prod build ---
	$ make build

	--- Run this command to pack crx extension from prior build ---
	$ make pack

	--- This command cleans prior build & artifacts ---
	$ make clean

endef


