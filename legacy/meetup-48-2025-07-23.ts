/**
 * AWS UG Vienna — Meetup #48
 * 2025-07-23 @ Millennium Tower (EBCONT)
 *
 * Update speaker details once confirmed on Sessionize.
 */

import type { MeetupEvent, AgendaItem } from "aws-community-austria-templates";
import { findSponsorByName } from "aws-community-austria-templates";
import { SPONSORS } from "../../sponsors";

export const MEETUP: MeetupEvent = {
  groupId: "aws-ug-vienna",
  meetupNumber: 48,
  title: "AWS Meetup #48",
  date: "2025-07-23",
  doorsOpen: "17:00",
  startTime: "18:00",
  endTime: "21:00",

  venue: {
    name: "Millennium Tower",
    company: "EBCONT",
    address: "Handelskai 94-96, 1200 Wien",
    floor: "Floor 36",
  },
  hostedBy: findSponsorByName(SPONSORS, "ebcont"),

  talks: [
    { sessionId: "818542" },
    { sessionId: "849521" },
  ],

  sponsors: [
    findSponsorByName(SPONSORS, "Raiffeisen Informatik"),
    findSponsorByName(SPONSORS, "Red Hat"),
    findSponsorByName(SPONSORS, "Public Cloud Group"),
    findSponsorByName(SPONSORS, "APA Tech"),
    findSponsorByName(SPONSORS, "Warrify"),
  ],
};

export const AGENDA: AgendaItem[] = [
  { time: "17:00 - 18:00", label: "Entry & networking" },
  { time: "18:00 - 18:10", label: "Welcome & introduction (AWS Community Vienna)" },
  { time: "18:10 - 18:20", label: "Sponsor introduction" },
  { time: "18:20 - 19:00", label: "Talk 1" },
  { time: "19:20 - 20:00", label: "Talk 2" },
  { time: "20:00 - Open End", label: "Networking" },
];
