# deck

The group's slide deck as the template for `make deck`. Save it here as
`aws-ug-vienna-austria.pptx`: in Google Slides, File, Download, Microsoft
PowerPoint (.pptx).

The file is gitignored (`deck/*.pptx`): it holds the organizers' emails and
photos. Only this README is committed. Change the deck in Google Slides as
usual and download it again; `make deck` finds the slides it fills in by
their text (`Meetup #52`, `#X Meetup`, `Shoutout`, `See you soon`,
`Introducing Our User Group Members`), so keep those texts on the visible
slides. See `../../meetup-deck/README.md`.
