# UnitPrettifier

A simple extension for Chromium-based web browsers to convert measurement units from one to another in a linear fashion.

## How to build & pack
1. Run this command to make ready to prod build 
	```make build```

2. Run this command to pack crx extension
	```make pack```

3. This command cleans prior build & artifacts 
	```make clean```

## How to install
### Option 1
Run command ```make build && chrome --load-extension=.\dist```
If you are using Chromium instead just replace ```chrome``` with ```chromium```

### Option 2
Run command ```make build && make pack```
And then in the Chrome extension window click ```Load