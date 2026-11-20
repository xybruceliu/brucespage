// Roughly where the visitor is, from nothing but their time zone. Browsers
// name the zone after a city (Europe/Madrid, Asia/Kolkata, Australia/Sydney),
// and the IANA time zone database (zone.tab) gives each of those cities'
// coordinates. No permission is asked and nothing leaves the page. It is
// right to within a few minutes of sunrise for most visitors, and as wrong
// as the time zone is wide for the rest (all of China keeps Shanghai's).
//
// Like `paintSky`, this is inlined into the page as a script that runs before
// the first paint, so it must stay self-contained.

/** [latitude, longitude] in degrees, north and east positive */
export function place(): [number, number] {
  // Every city in zone.tab, to the nearest degree
  const cities =
    'Abidjan 5 -4,Accra 6 0,Adak 52 -177,Addis_Ababa 9 39,Adelaide -35 139,Aden 13 45,Algiers 37 3,Almaty 43 77,Amman 32 36,Amsterdam 52 5,Anadyr 65 177,Anchorage 61 -150,Andorra 43 2,Anguilla 18 -63,Antananarivo -19 48,Antigua 17 -62,Apia -14 -172,Aqtau 45 50,Aqtobe 50 57,Araguaina -7 -48,Aruba 13 -70,Ashgabat 38 58,Asmara 15 39,Astrakhan 46 48,Asuncion -25 -58,Athens 38 24,Atikokan 49 -92,Atyrau 47 52,Auckland -37 175,Azores 38 -26,Baghdad 33 44,Bahia -13 -39,Bahia_Banderas 21 -105,Bahrain 26 51,Baku 40 50,Bamako 13 -8,Bangkok 14 101,Bangui 4 19,Banjul 13 -17,Barbados 13 -60,Barnaul 53 84,Beirut 34 36,Belem -1 -48,Belgrade 45 21,Belize 18 -88,Berlin 53 13,Bermuda 32 -65,Beulah 47 -102,Bishkek 43 75,Bissau 12 -16,Blanc-Sablon 51 -57,Blantyre -16 35,Boa_Vista 3 -61,Bogota 5 -74,Boise 44 -116,Bougainville -6 156,Bratislava 48 17,Brazzaville -4 15,Brisbane -27 153,Broken_Hill -32 141,Brunei 5 115,Brussels 51 4,Bucharest 44 26,Budapest 48 19,Buenos_Aires -35 -58,Bujumbura -3 29,Busingen 48 9,Cairo 30 31,Cambridge_Bay 69 -105,Campo_Grande -20 -55,Canary 28 -15,Cancun 21 -87,Cape_Verde 15 -24,Caracas 11 -67,Casablanca 34 -8,Casey -66 111,Catamarca -28 -66,Cayenne 5 -52,Cayman 19 -81,Center 47 -101,Ceuta 36 -5,Chagos -7 72,Chatham -44 -177,Chicago 42 -88,Chihuahua 29 -106,Chisinau 47 29,Chita 52 113,Christmas -10 106,Chuuk 7 152,Ciudad_Juarez 32 -106,Cocos -12 97,Colombo 7 80,Comoro -12 43,Conakry 10 -14,Copenhagen 56 13,Cordoba -31 -64,Costa_Rica 10 -84,Coyhaique -46 -72,Creston 49 -117,Cuiaba -16 -56,Curacao 12 -69,Dakar 15 -17,Damascus 34 36,Danmarkshavn 77 -19,Dar_es_Salaam -7 39,Darwin -12 131,Davis -69 78,Dawson 64 -139,Dawson_Creek 56 -120,Denver 40 -105,Detroit 42 -83,Dhaka 24 90,Dili -9 126,Djibouti 12 43,Dominica 15 -61,Douala 4 10,Dubai 25 55,Dublin 53 -6,DumontDUrville -67 140,Dushanbe 39 69,Easter -27 -109,Edmonton 54 -113,Efate -18 168,Eirunepe -7 -70,El_Aaiun 27 -13,El_Salvador 14 -89,Eucla -32 129,Fakaofo -9 -171,Famagusta 35 34,Faroe 62 -7,Fiji -18 178,Fort_Nelson 59 -123,Fortaleza -4 -38,Freetown 9 -13,Funafuti -9 179,Gaborone -25 26,Galapagos -1 -90,Gambier -23 -135,Gaza 32 34,Gibraltar 36 -5,Glace_Bay 46 -60,Goose_Bay 53 -60,Grand_Turk 21 -71,Grenada 12 -62,Guadalcanal -10 160,Guadeloupe 16 -62,Guam 13 145,Guatemala 15 -91,Guayaquil -2 -80,Guernsey 49 -3,Guyana 7 -58,Halifax 45 -64,Harare -18 31,Havana 23 -82,Hebron 32 35,Helsinki 60 25,Hermosillo 29 -111,Ho_Chi_Minh 11 107,Hobart -43 147,Hong_Kong 22 114,Honolulu 21 -158,Hovd 48 92,Indianapolis 40 -86,Inuvik 68 -134,Iqaluit 64 -68,Irkutsk 52 104,Isle_of_Man 54 -4,Istanbul 41 29,Jakarta -6 107,Jamaica 18 -77,Jayapura -3 141,Jersey 49 -2,Jerusalem 32 35,Johannesburg -26 28,Juba 5 32,Jujuy -24 -65,Juneau 58 -134,Kabul 35 69,Kaliningrad 55 21,Kamchatka 53 159,Kampala 0 32,Kanton -3 -172,Karachi 25 67,Kathmandu 28 85,Kerguelen -49 70,Khandyga 63 136,Khartoum 16 33,Kigali -2 30,Kinshasa -4 15,Kiritimati 2 -157,Kirov 59 50,Knox 41 -87,Kolkata 23 88,Kosrae 5 163,Kralendijk 12 -68,Krasnoyarsk 56 93,Kuala_Lumpur 3 102,Kuching 2 110,Kuwait 29 48,Kwajalein 9 167,Kyiv 50 31,La_Paz -16 -68,La_Rioja -29 -67,Lagos 6 3,Libreville 0 9,Lima -12 -77,Lindeman -20 149,Lisbon 39 -9,Ljubljana 46 15,Lome 6 1,London 52 0,Longyearbyen 78 16,Lord_Howe -32 159,Los_Angeles 34 -118,Louisville 38 -86,Lower_Princes 18 -63,Luanda -9 13,Lubumbashi -12 27,Lusaka -15 28,Luxembourg 50 6,Macau 22 114,Maceio -10 -36,Macquarie -54 159,Madeira 33 -17,Madrid 40 -4,Magadan 60 151,Mahe -5 55,Majuro 7 171,Makassar -5 119,Malabo 4 9,Maldives 4 74,Malta 36 15,Managua 12 -86,Manaus -3 -60,Manila 15 121,Maputo -26 33,Marengo 38 -86,Mariehamn 60 20,Marigot 18 -63,Marquesas -9 -139,Martinique 15 -61,Maseru -29 28,Matamoros 26 -97,Mauritius -20 58,Mawson -68 63,Mayotte -13 45,Mazatlan 23 -106,Mbabane -26 31,McMurdo -78 167,Melbourne -38 145,Mendoza -33 -69,Menominee 45 -88,Merida 21 -90,Metlakatla 55 -132,Mexico_City 19 -99,Midway 28 -177,Minsk 54 28,Miquelon 47 -56,Mogadishu 2 45,Monaco 44 7,Moncton 46 -65,Monrovia 6 -11,Monterrey 26 -100,Montevideo -35 -56,Monticello 37 -85,Montserrat 17 -62,Moscow 56 38,Muscat 24 59,Nairobi -1 37,Nassau 25 -77,Nauru -1 167,Ndjamena 12 15,New_Salem 47 -101,New_York 41 -74,Niamey 14 2,Nicosia 35 33,Niue -19 -170,Nome 65 -165,Norfolk -29 168,Noronha -4 -32,Nouakchott 18 -16,Noumea -22 166,Novokuznetsk 54 87,Novosibirsk 55 83,Nuuk 64 -52,Ojinaga 30 -104,Omsk 55 73,Oral 51 51,Oslo 60 11,Ouagadougou 12 -2,Pago_Pago -14 -171,Palau 7 134,Palmer -65 -64,Panama 9 -80,Paramaribo 6 -55,Paris 49 2,Perth -32 116,Petersburg 38 -87,Phnom_Penh 12 105,Phoenix 33 -112,Pitcairn -25 -130,Podgorica 42 19,Pohnpei 7 158,Pontianak 0 109,Port_Moresby -9 147,Port_of_Spain 11 -62,Port-au-Prince 19 -72,Porto_Velho -9 -64,Porto-Novo 6 3,Prague 50 14,Puerto_Rico 18 -66,Punta_Arenas -53 -71,Pyongyang 39 126,Qatar 25 52,Qostanay 53 64,Qyzylorda 45 65,Rankin_Inlet 63 -92,Rarotonga -21 -160,Recife -8 -35,Regina 50 -105,Resolute 75 -95,Reunion -21 55,Reykjavik 64 -22,Riga 57 24,Rio_Branco -10 -68,Rio_Gallegos -52 -69,Riyadh 25 47,Rome 42 12,Rothera -68 -68,Saipan 15 146,Sakhalin 47 143,Salta -25 -65,Samara 53 50,Samarkand 40 67,San_Juan -32 -69,San_Luis -33 -66,San_Marino 44 12,Santarem -2 -55,Santiago -33 -71,Santo_Domingo 18 -70,Sao_Paulo -24 -47,Sao_Tome 0 7,Sarajevo 44 18,Saratov 52 46,Scoresbysund 70 -22,Seoul 38 127,Shanghai 31 121,Simferopol 45 34,Singapore 1 104,Sitka 57 -135,Skopje 42 21,Sofia 43 23,South_Georgia -54 -37,Srednekolymsk 67 154,St_Barthelemy 18 -63,St_Helena -16 -6,St_Johns 48 -53,St_Kitts 17 -63,St_Lucia 14 -61,St_Thomas 18 -65,St_Vincent 13 -61,Stanley -52 -58,Stockholm 59 18,Swift_Current 50 -108,Sydney -34 151,Syowa -69 40,Tahiti -18 -150,Taipei 25 122,Tallinn 59 25,Tarawa 1 173,Tashkent 41 69,Tbilisi 42 45,Tegucigalpa 14 -87,Tehran 36 51,Tell_City 38 -87,Thimphu 27 90,Thule 77 -69,Tijuana 33 -117,Tirane 41 20,Tokyo 36 140,Tomsk 57 85,Tongatapu -21 -175,Toronto 44 -79,Tortola 18 -65,Tripoli 33 13,Troll -72 3,Tucuman -27 -65,Tunis 37 10,Ulaanbaatar 48 107,Ulyanovsk 54 48,Urumqi 44 88,Ushuaia -55 -68,Ust-Nera 65 143,Vaduz 47 10,Vancouver 49 -123,Vatican 42 12,Vevay 39 -85,Vienna 48 16,Vientiane 18 103,Vilnius 55 25,Vincennes 39 -88,Vladivostok 43 132,Volgograd 49 44,Vostok -78 107,Wake 19 167,Wallis -13 -176,Warsaw 52 21,Whitehorse 61 -135,Winamac 41 -87,Windhoek -23 17,Winnipeg 50 -97,Yakutat 60 -140,Yakutsk 62 130,Yangon 17 96,Yekaterinburg 57 61,Yerevan 40 45,Zagreb 46 16,Zurich 47 9'
  // Older names that some browsers still give
  const renamed: Record<string, string> = {
    Asmera: 'Asmara',
    Calcutta: 'Kolkata',
    Coral_Harbour: 'Atikokan',
    Enderbury: 'Kanton',
    Faeroe: 'Faroe',
    Godthab: 'Nuuk',
    Katmandu: 'Kathmandu',
    Kiev: 'Kyiv',
    Ponape: 'Pohnpei',
    Rangoon: 'Yangon',
    Saigon: 'Ho_Chi_Minh',
    Truk: 'Chuuk',
  }
  let city = (Intl.DateTimeFormat().resolvedOptions().timeZone || '')
    .split('/')
    .pop()!
  city = renamed[city] || city
  const list = ',' + cities + ','
  const at = city ? list.indexOf(',' + city + ' ') : -1
  if (at >= 0) {
    const entry = list.slice(at + 1, list.indexOf(',', at + 1)).split(' ')
    return [+entry[1], +entry[2]]
  }
  // A zone with no city (UTC, Etc/GMT+5): the middle of it, at a temperate
  // latitude, south of the equator if summer time falls in January
  const year = new Date().getFullYear()
  const january = new Date(year, 0, 1).getTimezoneOffset()
  const july = new Date(year, 6, 1).getTimezoneOffset()
  return [january < july ? -33 : 37.5, -Math.max(january, july) / 4]
}
