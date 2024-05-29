// piano
// bells
// organs
// guitars
// bows
// voices
// horns
// winds
// electro

export const generalUserPrograms: [number, number, string][] = [
  // piano - MAYBE
  [0, 0, "Stereo Grand"],
  [0, 1, "Bright Grand"],
  [0, 2, "Electric Grand"],
  [0, 3, "Honky-Tonk"],
  [0, 4, "Tine Electric Piano"],
  [0, 5, "FM Electric Piano"], // nice for chords, naturally soft, good for base FM Electric Piano
  [0, 6, "Harpsichord"],
  [8, 6, "Coupled Harpsichord"], // another harpsichord
  [11, 88, "Harpsi Pad"],

  // bell-y things YES
  [0, 7, "Clavinet"], // nice and plucky with good sustain. Good for melody. A little synthy
  [0, 8, "Celeste"],
  [0, 9, "Glockenspiel"],
  [0, 10, "Music Box"],
  [12, 4, "Bell Tine EP"], // nice sustatain. Bells and pianso

  [0, 11, "Vibraphone"],
  [0, 12, "Marimba"], // good for chords. Anti sibilant
  [0, 13, "Xylophone"],
  [0, 14, "Tubular Bells"], // this too
  [0, 15, "Dulcimer"], // good for melidy twangy sibilant old timey

  // pipes and organs and stuff UNSURE
  [0, 16, "Tonewheel Organ"],
  [0, 17, "Percussive Organ"],
  [0, 18, "Rock Organ"],
  [0, 19, "Pipe Organ"],
  [0, 20, "Reed Organ"],

  [8, 16, "Detuned Tnwl. Organ"],
  [8, 17, "Detuned Perc. Organ"],
  [8, 19, "Pipe Organ 2"],
  [8, 21, "Italian Accordian"],

  [0, 21, "Accordian"], // sounds like an accordion says emma - hate it now
  [0, 22, "Harmonica"],
  [0, 23, "Bandoneon"],

  // guitars and basses YES
  [0, 24, "Nylon Guitar"],
  [0, 25, "Steel Guitar"], // nice for melody
  [0, 26, "Jazz Guitar"],
  [0, 27, "Clean Guitar"], // very dirty
  [0, 28, "Muted Guitar"], // highly stochato, so, percussive
  [8, 25, "12-String Guitar"], // very plucky but still resonant with medium sustain. Good range. Good chords
  // [8, 26, "Hawaiian Guitar"],
  [8, 27, "Chorused Clean Gt."],
  [12, 27, "Clean Guitar 2"],
  // [8, 28, "Funk Guitar"],
  // [8, 30, "Feedback Guitar"],
  // [8, 31, "Guitar Feedback"],

  //   [0, 29, "Overdrive Guitar"],
  //   [0, 30, "Distortion Guitar"],
  //   [0, 31, "Guitar Harmonics"],
  [8, 107, "Taisho Koto"],
  [0, 32, "Acoustic Bass"], // ok for chords
  [0, 33, "Finger Bass"],
  [0, 34, "Pick Bass"], // kinda annoying, kinda good for both
  [0, 35, "Fretless Bass"], // ditto too above, more like steel drums
  [0, 36, "Slap Bass 1"], // very stochato
  [0, 37, "Slap Bass 2"], // extra super stochato
  [0, 38, "Synth Bass 1"], // classic synth sound (little stochato)
  [0, 39, "Synth Bass 2"], // more plucky

  // classical bow strings YES
  [0, 40, "Violin"], // romantic - quite bow-y. Round sounding
  [0, 41, "Viola"], // more shrill
  [0, 42, "Cello"], // beautiful maybe even better
  [0, 43, "Double Bass"], // just ok
  //   [0, 44, "Stereo Strings Trem"],
  [0, 45, "Pizzicato Strings"], // so much fun!!
  [0, 46, "Orchestral Harp"], // very soothing beautiful. Melody and chords
  [0, 47, "Timpani"], // trash cans. only for melody
  //   [0, 48, "Stereo Strings Fast"],
  // strings
  [0, 49, "Stereo Strings Slow"], // good for non-arpegiated chords
  [0, 50, "Synth Strings 1"], // good for non-arpegiated chords
  [0, 51, "Synth Strings 2"], // pretty much the same

  // voices YES
  [0, 52, "Concert Choir"], // kinda surprising, its a person, chords
  [0, 53, "Voice Oohs"], // better for melody, really interesting
  [0, 54, "Synth Voice"], // not as good
  [11, 78, "Whistlin'"], // maybe good for voices section. Good for sustained chords
  [1, 52, "Concert Choir Mono"], // fuller choir sound than other voicies. Compare with other voices

  // horns kinda meh YES
  //   [0, 55, "Orchestra Hit"],
  [0, 56, "Trumpet"], // meh
  [0, 57, "Trombone"], // meh
  [0, 58, "Tuba"], // meh, best of the brass
  [0, 59, "Muted Trumpet"], // more fun, maybe melody
  [0, 60, "French Horns"],
  [13, 48, "Woodwind Choir"],

  [1, 59, "Muted Trumpet 2"], // maybe little bit too rattly spit sound at start
  [1, 60, "Solo French Horn"], // smooth. Maybe too piano-ey
  // [1, 61, "Brass Section Mono"],

  //   [0, 61, "Brass Section"],
  [0, 62, "Synth Brass 1"], // ok. Kinda buzzy / static-y
  [0, 63, "Synth Brass 2"], // ok. Smoother
  [120, 56, "SFX Kit"], // fun to play for melody

  // reeds section YES
  //
  [0, 64, "Soprano Sax"], // nice. Breathy
  //   [0, 65, "Alto Sax"],    // more ska
  //   [0, 66, "Tenor Sax"], // electricy
  //   [0, 67, "Baritone Sax"], //
  [0, 68, "Oboe"], // some nice notes.
  [0, 69, "English Horn"], // nice
  [0, 70, "Bassoon"],
  [0, 71, "Clarinet"],

  // airy winds
  // - especially the flute is nice
  //
  [0, 72, "Piccolo"], // anti sibilant good for chords
  [0, 73, "Flute"], // beatiful almost like a string
  //   [0, 74, "Recorder"],
  [0, 75, "Pan Flute"],
  [0, 76, "Bottle Blow"], // good
  //   [0, 77, "Shakuhachi"],
  [0, 78, "Irish Tin Whistle"],
  [0, 79, "Ocarina"],

  // electric YES
  [0, 80, "Square Lead"],
  [0, 88, "Fantasia"], // glittery. Good for chords maybe
  [12, 88, "Fantasia 2"],
  [0, 89, "Warm Pad"], // good chords
  [0, 91, "Space Voice"], // voicy. Nice for sustained chords
  [0, 92, "Bowed Glass"], // both chords. Glittery up top in melody. Slow
  [0, 93, "Metal Pad"], // sustained chords
  [0, 95, "Sweep Pad"], // sustained chords and stuff
  [0, 98, "Crystal"], // magical spooky. Sorta fun. Kinda sibilant
  [0, 99, "Atmosphere"], // good for chords. Nice highs and lows. Synthy bass
  [0, 103, "Star Theme"], // highly defined, very sibilant. metallic
  [1, 38, "Synth Bass 101"], // highly staccato with a long sustain. Jammy space arcade computer game sound
  [1, 80, "Square Wave"], // very 8 bit. Sounds like pacman
  [1, 81, "Saw Wave"], //
  [1, 124, "Telephone 2"], // very unique. Horrendous
  [8, 4, "Chorused Tine EP"],
  [8, 5, "Chorused FM EP"], // twin peaks soundtrack when low
  [8, 80, "Sine Wave"], // beautiful. Tends towards high. Something funky with the quietness of the lows
  [11, 38, "Techno Bass"], // infinite sustain and plucky. Still kinda weak sound so dissolves into background
  [11, 39, "Pulse Bass"], // similar. Bad sound range
  [12, 80, "Square Lead 2"], //
  [12, 81, "Saw Lead 2"], // buzzy drone
  [13, 88, "Night Vision"], // nice spacious sustain for chords

  //   [0, 81, "Saw Lead"],
  //   [0, 82, "Synth Calliope"],
  //   [0, 83, "Chiffer Lead"],
  //   [0, 84, "Charang"],
  //   [0, 85, "Solo Vox"],
  //   [0, 86, "5th Saw Wave"],
  //   [0, 87, "Bass & Lead"],
  //   [0, 90, "Polysynth"],
  // [0, 94, "Halo Pad"], // slow

  // [0, 96, "Ice Rain"], // glittery
  // [0, 97, "Soundtrack"], // spooky. Not great for babies
  // [0, 100, "Brightness"],   //
  // [0, 101, "Goblin"],          // slow build up wind howelling synth. Too breathy
  // [0, 102, "Echo Drops"], // voicy. Slow build up choiristic synth. Kinda undefined

  // [0, 104, "Sitar"],  // a sitar
  // [0, 105, "Banjo"],  // Very staccato. strum is too short. Not a great full sound.
  // [0, 106, "Shamisen"], // small sound. Very staccato
  // [0, 107, "Koto"], // similar to above
  // [0, 108, "Kalimba"], // too short porcusive bells / xylephone
  // [0, 109, "Bagpipes"], // nope
  // [0, 110, "Fiddle"], // kinda weird sound quality
  // [0, 111, "Shenai"],  // very 8-bit sound. Little too obnoxious
  // [0, 112, "Tinker Bell"], // little too dissonant in resonance
  // [0, 113, "Agogo"], // too staccato. Percussive. Weird sound quality
  // [0, 114, "Steel Drums"],  // sounds decent for steel drums

  // too much percussion
  // [0, 115, "Wood Block"],  // nope
  // [0, 116, "Taiko Drum"],
  // [0, 117, "Melodic Tom"],
  // [0, 118, "Synth Drum"],
  // [0, 119, "Reverse Cymbal"],
  // [0, 120, "Fret Noise"],
  // [0, 121, "Breath Noise"],

  // weird sounds
  // [0, 122, "Seashore"],
  // [0, 123, "Birds"],
  // [0, 124, "Telephone 1"],
  // [0, 125, "Helicopter"],
  // [0, 126, "Applause"],
  // [0, 127, "Gun Shot"],

  // [1, 44, "Mono Strings Trem"], // crummy orchestra sound
  // [1, 48, "Mono Strings Fast"],  // ditto
  // [1, 49, "Mono Strings Slow"],  // ditto
  // [1, 56, "Trumpet 2"], // trumpets are annoying
  // [1, 57, "Trombone 2"], //

  // [1, 98, "Synth Mallet"],
  // [1, 120, "Cut Noise"],
  // [1, 121, "Fl. Key Click"],
  // [1, 122, "Rain"],
  // [1, 123, "Dog"],

  // [1, 125, "Car-Engine"],
  // [1, 126, "Laughing"],
  // [1, 127, "Machine Gun"],
  // [2, 102, "Echo Pan"], // synthy steel drums. Soft
  // [2, 120, "String Slap"],
  // [2, 122, "Thunder"],
  // [2, 123, "Horse Gallop"],
  // [2, 124, "Door Creaking"],
  // [2, 125, "Car-Stop"],
  // [2, 126, "Scream"],
  // [2, 127, "Lasergun"],
  // [3, 122, "Howling Winds"],
  // [3, 123, "Bird 2"],
  // [3, 124, "Door"],
  // [3, 125, "Car-Pass"],
  // [3, 126, "Punch"],
  // [3, 127, "Explosion"],
  // [4, 122, "Stream"],
  // [4, 123, "Scratch"],
  // [4, 125, "Car-Crash"],
  // [4, 126, "Heart Beat"],
  // [5, 122, "Bubbles"],
  // [5, 124, "Windchime"],
  // [5, 125, "Siren"],
  // [5, 126, "Footsteps"],
  // [6, 125, "Train"],
  // [7, 125, "Jet Plane"],

  // [8, 14, "Church Bells"],
  // [8, 24, "Ukulele"], // wimpy plucked string

  // [8, 38, "Synth Bass 3"], // too short of sustain for synth sound
  // [8, 39, "Synth Bass 4"], // ditto
  // [8, 48, "Orchestra Pad"],
  // [8, 50, "Synth Strings 3"],
  // [8, 61, "Brass Section 2"],
  // [8, 62, "Synth Brass 3"],
  // [8, 63, "Synth Brass 4"],

  // [8, 81, "Doctor Solo"],

  // [8, 115, "Castanets"],
  // [8, 116, "Concert Bass Drum"],
  // [8, 117, "Melodic Tom 2"],
  // [8, 118, "808 Tom"],
  // [8, 125, "Starship"],
  // [9, 14, "Carillon"], // alien bells.
  // [9, 125, "Burst Noise"],
  // [11, 0, "Piano & Str.-Fade"],
  // [11, 1, "Piano & Str.-Sus"],
  // [11, 4, "Tine & FM EPs"],
  // [11, 5, "Piano & FM EP"],
  // [11, 8, "Tinkling Bells"],
  // [11, 14, "Bell Tower"],

  // [11, 49, "Stereo Strings Velo"],
  // [11, 50, "Synth Strings 4"],
  // [11, 51, "Synth Strings 5"],
  // [11, 61, "Brass Section 3"],

  // [11, 81, "Sawtooth Stab"],
  // [11, 87, "Doctor's Solo"],

  // [11, 89, "Solar Wind"],
  // [11, 96, "Mystery Pad"], // not enough sustain

  // [11, 98, "Synth Chime"],
  // [11, 100, "Bright Saw Stack"],
  // [11, 119, "Cymbal Crash"],
  // [11, 121, "Filter Snap"],
  // [11, 127, "Interference"],
  // [12, 0, "Bell Piano"],

  // [12, 10, "Christmas Bells"],

  // [12, 38, "Mean Saw Bass"],
  // [12, 48, "Full Orchestra"],
  // [12, 49, "Mono Strings Velo"],

  // [12, 89, "Solar Wind 2"],
  // [12, 119, "Tambourine"],
  // [12, 122, "White Noise Wave"],
  // [12, 127, "Shooting Star"],

  // [13, 80, "Square Lead 3"],
  // [13, 81, "Saw Lead 3"],
  // [16, 25, "Mandolin"],
  // [120, 0, "Standard Drums"],
  // [120, 1, "Standard 2 Drums"],
  // [120, 8, "Room Drums"],
  // [120, 16, "Power Drums"],
  // [120, 24, "Electronic Drums"],
  // [120, 25, "808/909 Drums"],
  // [120, 26, "Dance Drums"],
  // [120, 32, "Jazz Drums"],
  // [120, 40, "Brush Drums"],
  // [120, 48, "Orchestral Perc."],

  // [128, 0, "Standard"],
  // [128, 1, "Standard 2"],
  // [128, 8, "Room"],
  // [128, 16, "Power"],
  // [128, 24, "Electronic"],
  // [128, 25, "808/909"],
  // [128, 26, "Dance"],
  // [128, 32, "Jazz"],
  // [128, 40, "Brush"],
  // [128, 48, "Orchestral"],
  // [128, 56, "SFX"],
];
