# Singalong — test & dev targets
# Run `make test` for the full fast suite (no server needed).
# Run `make test-e2e` for Playwright tests (needs `make dev-server` running).
# Run `make test-all` for everything.

.PHONY: test test-unit test-e2e test-all dev-server install

## Fast unit tests — no LiveKit, no browser required
test: test-unit

test-unit:
	@echo "▶ Running unit tests (server API + mix-minus)…"
	cd server && npm test

## Playwright E2E — requires coordination server on :4000
## Start the server first: make dev-server
test-e2e:
	@echo "▶ Running Playwright E2E tests…"
	@echo "   (server-api suite skips gracefully if :4000 is not running)"
	npx playwright test --project=chromium

## Run all tests
test-all: test-unit test-e2e

## Start the coordination server (blocks; run in a separate terminal)
dev-server:
	@echo "▶ Starting coordination server on :4000…"
	cd server && node index.js

## Install all dependencies
install:
	npm install
	cd server && npm install
	cd agent && npm install
	npx playwright install chromium
