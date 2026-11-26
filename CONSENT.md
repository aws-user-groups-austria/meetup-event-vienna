# Consent

Every screen of a meetup evening shows people and companies: speaker photos,
the team, the photo collage, host and sponsor logos. This file is the rule for
all of them, and `consent.json` with `make consent` is what keeps it a rule.

## The rule

**A photo, a biography or a logo goes into this repository only after its owner
has agreed, and `consent.json` says where that agreement comes from.**

`make consent` fails when an image in `people/`, `logos/`, `community/`,
`badges/` or `events/<id>/assets/` has no entry in `consent.json`. The same
check runs on every pull request and every push.

Announcement cards in `events/<id>/canva/` and deck previews in
`events/<id>/deck/` are made from the same photos and follow them: when a photo
goes, the cards made from it go too.

## Where the agreement comes from

| Basis | What it means | What it covers |
|---|---|---|
| `preview` | The usual one. Before a meetup is published we send its page to the speakers, the host and the sponsors. They see their name, photo, biography or logo on it and agree | That meetup: its page, the room screen, the slide deck and the archive of past meetups, as the preview message says |
| `sessionize` | The speaker submitted the talk, photo and biography to our call for speakers on Sessionize, which shares them with the event they were submitted to | That meetup: its page, the room screen, the slide deck and the archive of past meetups |
| `sponsor` | The host or sponsor agreed that we show their logo for the meetup they host or sponsor | That meetup, and the list of hosts who have had us |
| `asked` | We asked the person or the company and they said yes. `by` and `date` say who asked and when | What was asked for, written in `note` |
| `own` | The group's own material with no person in it: badges, drawings | Everything |
| `public-page` | A screenshot of a public website, shown with its link | The screen that links to that page |
| `before-ledger` | The file was here before this ledger started on 13 November 2026. An organizer still has to replace this with one of the bases above | Nothing new: do not copy the file anywhere else until it is confirmed |

Sessionize covers less than it looks like. Its privacy policy says a speaker's
data is shared with "the events you submit your sessions to". It does not say
what an organizer may publish, and it grants no licence. So `sessionize` is a
basis for showing a speaker at the meetup they submitted to, not for anything
after it. A photo for the collage, a team card, a photo cut from an older
announcement or a picture taken at a meetup needs `asked`.

Photos taken during a meetup are announced at the welcome. Anyone who does not
want to be in a picture says so to a leader, and is left out or removed.

## How it works in practice

Nobody signs anything. Consent has to be informed and we have to be able to
show it was given, and a reply to a message does both.

1. **Before a meetup is published**, the speakers, the host and the sponsors get
   the page to look at. That message carries one extra sentence, so they agree
   to everything the page feeds and not only to the page:

   > Your name, photo, bio and talk (for hosts and sponsors: your logo) will
   > appear on the Meetup page, on awscommunity.at, on the screen in the room
   > and in our slide deck, and stay in our archive of past meetups, which is
   > public on GitHub. Tell us any time and we take them down.

2. **When they say it is fine**, the files go in, each with a `preview` entry
   that names the meetup and the day they agreed. The reply itself stays in the
   organizers' mailbox or chat. It does not go into this repository.
3. **The team** agrees once, for their own photo and role, as `asked`.
4. **Everything else**, such as a photo for the collage or a picture reused
   from an older meetup, is asked for separately, as `asked`.

## Add an entry

```json
"events/2026-10-20-aws-meetup-vienna-53/assets/rbi.svg": { "basis": "preview", "date": "2026-10-01", "note": "Meetup #53, host" },
"people/ada-lovelace.png": { "basis": "asked", "by": "Linda", "date": "2026-11-13", "note": "team card and room screen" }
```

The dates above are examples. `preview` needs `date` and the meetup in `note`.
`sessionize` and `sponsor` need the meetup in `note`. `asked` needs `by`,
`date` and `note`. Write down who asked, not a private message or an address.

## Take something down

Anyone can ask for their photo, biography or logo to be removed, at any time
and without a reason: tell a leader at a meetup or use "Contact Us" on
[awscommunity.at](https://awscommunity.at). We delete the file and its entry,
run `make update`, and the website and the room screen follow on the next
build. The file stays in the git history of this public repository unless the
history is rewritten, so say when that matters.

## What other user groups may reuse

The tools and the layout, under the [licence](LICENSE). Not the people and not
the logos: consent given to us is not consent given to you.
