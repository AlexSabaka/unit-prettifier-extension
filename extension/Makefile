####################################
# Build command for Chrome Extension
####################################

ch = chromium
build = build
dist = dist
extension_name = EasyMeasure

.PHONY: help build

help:
	$(info ${HELP_MESSAGE})
	@exit 0

build:
	@echo 'Preparing new extension build..' 
	@export INLINE_RUNTIME_CHUNK=false; \
	export GENERATE_SOURCEMAP=false; \
	yarn build
	@mkdir -p $(dist)
	@cp -r $(build)/* $(dist)
	@echo 'Renaming files...' 
	@mv $(dist)/index.html $(dist)/popup.html
	@exit 0

pack:
	@echo 'Packing extension...'
	@$(ch) --pack-extension=$(dist)
	@echo 'Renaming packed extension & private key file...'
	@mv ./$(dist).crx ./$(extension_name).crx
	@mv ./$(dist).pem ./$(extension_name).pem
	@echo 'Done'
	@exit 0

publish:
	@echo 'Packing extension for the publishing in the Chrome Web Store'
	@echo 'Not implemented'
	@exit 255

clean:
	@echo 'Cleaning...'
	@rm -rf ./$(dist)/*
	@rm -rf ./$(build)/*
	@rm -rf $(dist)
	@rm -rf $(build)
	@rm -f $(extension_name).crx
	@rm -f $(extension_name).pem
	@echo 'Prior build cleaned!'
	@exit 0

run:
	@echo 'Starting '$(ch)' with extension from './$(dist)'...'
	$(ch) --disable-extensions-except=./$(dist) --load-extension=./$(dist)
	@exit 0

define HELP_MESSAGE

	--- Run this command to make ready to prod build ---
	$ make build

	--- Run this command to pack crx extension from prior build ---
	$ make pack

	--- Starts a new '$(ch)' instance with extension ---
	$ make run

	--- This command cleans prior build & artifacts ---
	$ make clean

endef


