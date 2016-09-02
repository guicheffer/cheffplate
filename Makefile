help:
	@echo "Please use 'make <target>' where <target> is one of commands below"
	@echo "  install		=> install package dependencies from package.json"
	@echo "  dev			=> run project in dev mode"
	@echo "  test			=> test all tests well-tested"
	@echo "  deploy		=> build all files directly for deploying"

install:
	npm install

dev:
	npm start

test:
	npm test

# Be sure on testing
deploy: test
	npm run start:build