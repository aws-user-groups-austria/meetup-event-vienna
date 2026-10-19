# One folder per meetup under events/<id>/. See README.md.
#
#   make new URL="<meetup event link>"           create events/<id>/ from a link, then sync it
#   make sync EVENT=<id>                          fetch the live Meetup page (and Sessionize, if source.json names it), write events/<id>/event.json
#   make sync-offline EVENT=<id>                  same, from a saved page and no network (Sessionize from events/<id>/sessionize.html if saved)
#   make sync-all-offline                         sync-offline for every event that has a saved page
#   make review EVENT=<id>                        one local page with the real stills, deck and website screenshots; opens it
#   make deck-pdf EVENT=<id>                      the filled-in deck as PDF, through PowerPoint (macOS; opens it briefly)
#   make archive                                  every past meetup from the group's Meetup page: events/<id>/meetup.json (+ event.json where the agenda parses)
#   make deck EVENT=<id>                          the group's slide deck filled in for this meetup: events/<id>/deck/<id>.pptx

SYNC_DIR ?= ../meetup-sync
SYNC      = node $(SYNC_DIR)/src/cli.ts
FIXTURES ?= $(SYNC_DIR)/tests/fixtures
DECK_DIR      ?= ../meetup-deck
TEMPLATES_DIR ?= ../meetup-stream-templates
# The group's deck, exported from Google Slides as .pptx. Gitignored: it holds organizer emails and photos.
TEMPLATE      ?= deck/aws-ug-vienna-austria.pptx
# The coming AWS Community Days; each event.json gets the ones after its date.
UPCOMING      ?= upcoming.json
# The group's past events on Meetup, for make archive.
PAST_EVENTS   ?= https://www.meetup.com/amazon-web-services-aws-vienna/events/?type=past
# Shared host and sponsor logos for the dark screens.
LOGOS         ?= logos.json
LOGOS_ARG      = $(if $(wildcard $(LOGOS)),--logos "$(LOGOS)") $(if $(wildcard people),--people people) $(if $(wildcard community.json),--community community.json)
# The group's Sessionize endpoint, for past speakers' photos in make archive.
SESSIONIZE    ?= 3epsgjj2
UPCOMING_ARG   = $(if $(wildcard $(UPCOMING)),--upcoming "$(UPCOMING)")

EVENT_DIR  = events/$(EVENT)
EVENT_SLUG = $(shell printf '%s' '$(EVENT)' | sed -E 's/^[0-9]{4}-[0-9]{2}-[0-9]{2}-//')
HTML      ?= $(firstword $(wildcard $(EVENT_DIR)/page.html) $(wildcard $(FIXTURES)/$(EVENT_SLUG).html))

.PHONY: help sync sync-offline sync-all-offline new check-event deck archive review deck-pdf

help:
	@sed -n 's/^#   //p' Makefile

$(SYNC_DIR)/node_modules:
	npm --prefix $(SYNC_DIR) ci

check-event:
	@test -n "$(EVENT)" || { echo "usage: make $(MAKECMDGOALS) EVENT=<id>   (ids: $$(ls events | grep -v README | tr '\n' ' '))" >&2; exit 2; }
	@test -f "$(EVENT_DIR)/source.json" || { echo "$(EVENT_DIR)/source.json not found" >&2; exit 2; }

sync: check-event $(SYNC_DIR)/node_modules
	@url=$$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).meetupUrl || "")' "$(EVENT_DIR)/source.json") && \
	test -n "$$url" || { echo "$(EVENT_DIR)/source.json has no meetupUrl" >&2; exit 2; } && \
	$(SYNC) sync "$$url" --overrides "$(EVENT_DIR)/source.json" $(UPCOMING_ARG) $(LOGOS_ARG) --out "$(EVENT_DIR)/event.json" --meetup-out "$(EVENT_DIR)/meetup.json"

sync-offline: check-event $(SYNC_DIR)/node_modules
	@test -n "$(HTML)" && test -f "$(HTML)" || { echo "no saved page for $(EVENT): put it at $(EVENT_DIR)/page.html or pass HTML=<file>" >&2; exit 2; }
	$(SYNC) sync "$(HTML)" --overrides "$(EVENT_DIR)/source.json" --sessionize "$(or $(wildcard $(EVENT_DIR)/sessionize.html),none)" $(UPCOMING_ARG) $(LOGOS_ARG) --out "$(EVENT_DIR)/event.json" --meetup-out "$(EVENT_DIR)/meetup.json"

sync-all-offline:
	@for d in events/*/; do \
	  id=$$(basename "$$d"); \
	  test -f "$$d/source.json" || continue; \
	  $(MAKE) --no-print-directory sync-offline EVENT=$$id || exit $$?; \
	done

new: $(SYNC_DIR)/node_modules
	@test -n "$(URL)" || { echo 'usage: make new URL="<meetup event link>"' >&2; exit 2; }
	@url=$$(node -e 'const u = new URL(process.argv[1]); u.search = ""; u.hash = ""; if (!u.pathname.endsWith("/")) u.pathname += "/"; if (!/^\/[^/]+\/events\/\d+\/$$/.test(u.pathname)) { console.error("not a Meetup event link: " + process.argv[1]); process.exit(2); } process.stdout.write(u.href)' "$(URL)") && \
	dup=$$(node -e 'const fs = require("fs"); const want = new URL(process.argv[1]).pathname; for (const d of fs.readdirSync("events")) { try { const u = new URL(JSON.parse(fs.readFileSync("events/" + d + "/source.json", "utf8")).meetupUrl); if (u.pathname.replace(/\/?$$/, "/") === want) { process.stdout.write(d); break; } } catch {} }' "$$url") && \
	{ test -z "$$dup" || { echo "events/$$dup already has this link; update it with: make sync EVENT=$$dup" >&2; exit 1; }; } && \
	id=$$($(SYNC) id "$(or $(FROM),$$url)") && \
	test -n "$$id" && \
	{ test ! -e "events/$$id/source.json" || { echo "events/$$id already exists" >&2; exit 1; }; } && \
	mkdir -p "events/$$id" && \
	node -e 'require("fs").writeFileSync(process.argv[2], JSON.stringify({ meetupUrl: process.argv[1], overrides: {} }, null, 2) + "\n")' "$$url" "events/$$id/source.json" && \
	printf '%s\n' "# $$id" "" "One meetup for the evening stream: \`source.json\` holds the Meetup link and" "the overrides (edit it), \`event.json\` is generated from it (do not edit)," "and \`assets/\` holds speaker photos and sponsor logos when there are any." "How to sync it and how to add photos: \`../../README.md\`." > "events/$$id/README.md" && \
	echo "created events/$$id/source.json and README.md" && \
	$(MAKE) --no-print-directory $(if $(FROM),sync-offline HTML="$(FROM)",sync) EVENT=$$id

deck: check-event
	@test -f "$(TEMPLATE)" || { echo "No $(TEMPLATE): in Google Slides, File, Download, Microsoft PowerPoint, and save it there (it stays out of git)" >&2; exit 2; }
	@test -f "$(EVENT_DIR)/event.json" || { echo "No $(EVENT_DIR)/event.json: run make sync EVENT=$(EVENT) first" >&2; exit 2; }
	$(MAKE) -C $(TEMPLATES_DIR) stills EVENT=$(EVENT)
	@mkdir -p "$(EVENT_DIR)/deck"
	@img=$$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).image || "")' "$(EVENT_DIR)/event.json") && \
	if [ -n "$$img" ]; then \
	  curl -fsSL -o "$(EVENT_DIR)/deck/header.jpeg" "$$img" && echo "downloaded the Meetup header image" || echo "could not download the Meetup header image, keeping $(EVENT_DIR)/deck/header.jpeg if there is one" >&2; \
	else echo "the event has no header image on Meetup" >&2; fi
	@header="$(EVENT_DIR)/deck/header.jpeg"; \
	if [ -f "$$header" ]; then set -- --header "$$header"; else set --; fi; \
	if [ -d "$(EVENT_DIR)/canva" ]; then set -- "$$@" --canva "$(EVENT_DIR)/canva"; fi; \
	uv run --project $(DECK_DIR) meetup-deck --template "$(TEMPLATE)" --event "$(EVENT_DIR)/event.json" --stills "$(TEMPLATES_DIR)/out/stills" "$$@" --out "$(EVENT_DIR)/deck/$(EVENT).pptx"

archive: $(SYNC_DIR)/node_modules
	$(SYNC) archive "$(PAST_EVENTS)" --events-dir events $(LOGOS_ARG) --sessionize "$(SESSIONIZE)" $(if $(REFRESH),--refresh)

review: check-event
	node tools/review.mjs "$(EVENT)"
	open "$(EVENT_DIR)/review/index.html"

# PowerPoint is addressed by this file's name only, never "the active presentation",
# so whatever else is open there is left alone.
deck-pdf: check-event
	@test -f "$(EVENT_DIR)/deck/$(EVENT).pptx" || { echo "No deck yet: make deck EVENT=$(EVENT)" >&2; exit 2; }
	@box="$$HOME/Library/Containers/com.microsoft.Powerpoint/Data"; name="review-$(EVENT).pptx"; \
	cp "$(EVENT_DIR)/deck/$(EVENT).pptx" "$$box/$$name" && \
	osascript -e "tell application \"Microsoft PowerPoint\"" \
	  -e "open POSIX file \"$$box/$$name\"" \
	  -e "set n to 0" \
	  -e "repeat until (exists presentation \"$$name\") or n > 30" -e "delay 1" -e "set n to n + 1" -e "end repeat" \
	  -e "set p to presentation \"$$name\"" \
	  -e "save p in POSIX file \"$$box/review-$(EVENT).pdf\" as save as PDF" \
	  -e "close p saving no" -e "end tell" && \
	mv "$$box/review-$(EVENT).pdf" "$(EVENT_DIR)/deck/$(EVENT).pdf" && rm -f "$$box/$$name" "$$box/~\$$$$name" && \
	echo "wrote $(EVENT_DIR)/deck/$(EVENT).pdf" && \
	sips -s format png --resampleWidth 1280 "$(EVENT_DIR)/deck/$(EVENT).pdf" --out "$(EVENT_DIR)/deck/$(EVENT)-cover.png" >/dev/null && \
	echo "wrote $(EVENT_DIR)/deck/$(EVENT)-cover.png (the first slide, the deck's preview on the website)"
