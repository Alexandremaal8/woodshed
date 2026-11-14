// ---------- Extra chapters (v1.4): shorthand, rhythm, keys, more chords, arpeggios, modes, phrasing ----------
const TAB_RIFF = `e|---------------------|
B|---------------------|
G|-----------------7---|
D|---------5---7h9-----|
A|-----7---------------|
E|-0-------------------|`;

const CH_SHORTHAND = {
  id: 'cR', title: 'Reading the Shorthand', icon: '🔤',
  blurb: 'Chord diagrams, chord names, tabs, sharps and flats: read anything a guitarist writes.',
  lessons: [
    {
      id: 'r-1', title: 'Reading chord diagrams',
      cards: [
        { h: 'A picture of the neck, standing up', p: 'A chord diagram is the neck seen from the front, standing up. <b>Vertical lines = strings</b>: the low E is on the <b>left</b>, the high e on the right. <b>Horizontal lines = frets</b>. The thick bar at the top is the nut.', chord: [5, 'maj'] },
        { h: 'Dots and numbers', p: 'A dot shows where to press. The number inside is the <b>finger</b>: 1 = index, 2 = middle, 3 = ring, 4 = pinky. A long bar = a <b>barre</b>: one finger presses several strings.' },
        { h: '× and ○', p: '<b>×</b> above a string = don’t play it. <b>○</b> = play it open. Here, D major: don’t play the two low strings.', chord: [2, 'maj'] },
        { h: 'Higher up the neck', p: 'If the shape starts higher, the first fret is written on the side (“5”, or “5fr”). Everything is then counted from there.', chord: [9, 'min', 'E'] },
      ],
      quiz: [
        { t: 'mc', id: 'qr-1a', q: 'In a chord diagram, the leftmost vertical line is…', o: ['The high e string', 'The low E string', 'The 1st fret', 'The nut'], a: 1, ex: 'Low E on the left, high e on the right.' },
        { t: 'mc', id: 'qr-1b', q: 'A “3” inside a dot means…', o: ['3rd fret', '3rd string', 'Ring finger', 'Play 3 times'], a: 2, ex: '1 index, 2 middle, 3 ring, 4 pinky.' },
        { t: 'mc', id: 'qr-1c', q: 'An × above a string means…', o: ['Play it open', 'Don’t play it', 'Barre it', 'Mute with the palm'], a: 1, ex: '× = skip it, ○ = open.' },
        { t: 'mc', id: 'qr-1d', q: 'A long bar across several strings is…', o: ['A slide', 'A barre with one finger', 'The nut', 'A bend'], a: 1, ex: 'One finger (usually the index) presses them all.' },
      ],
      practice: { type: 'drill', title: 'Read and play', how: 'Open Index › C, G, D and A › Chords. For each one, read the diagram, play it, then check by tapping the diagram to hear it. Then switch between G and D every 4 beats.', bpm: 70 },
      jam: { prompt: 'Strum or arpeggiate the chords as they pass. Use the chord names on screen, nothing else.', style: 'pop', key: 'G', scale: 'majorPent', tone: 'Clean + chorus' },
    },
    {
      id: 'r-2', title: 'Chord names decoded',
      cards: [
        { h: 'The letter is the root', p: 'The letter (with its # or b) is the note the chord is built on. <b>A letter alone = major</b>: G means G major.' },
        { h: 'What comes after', p: '<b>m</b> = minor (Gm) · <b>7</b> = adds the minor 7th (G7) · <b>maj7</b> = adds the major 7th (Gmaj7) · <b>m7</b> = minor + minor 7th (Gm7) · <b>5</b> = power chord, root + 5th only (G5).' },
        { h: 'More symbols', p: '<b>sus2 / sus4</b> = the 3rd is replaced by the 2nd or 4th · <b>add9</b> = major chord + 9th · <b>dim</b> or <b>°</b> = diminished · <b>aug</b> or <b>+</b> = augmented · <b>6</b> = major + 6th.' },
        { h: 'Slash chords', p: '<b>G/B</b> means “G chord, with B as the lowest note”. The letter after the slash is the <b>bass note</b>. Used to make smooth bass lines.' },
      ],
      quiz: [
        { t: 'mc', id: 'qr-2a', q: 'What does “Am7” mean?', o: ['A major + 7th', 'A minor + minor 7th', 'A minor, 7th fret', 'A with a 7 in the bass'], a: 1, ex: 'm = minor, 7 = minor 7th added: A C E G.' },
        { t: 'mc', id: 'qr-2b', q: 'In “D/F#”, F# is…', o: ['The 7th', 'The bass note', 'A sus note', 'The key'], a: 1, ex: 'After the slash = lowest note.' },
        { t: 'mc', id: 'qr-2c', q: 'Which notes make Csus4?', o: ['C E G', 'C F G', 'C D G', 'C Eb G'], a: 1, ex: 'The 3rd (E) is replaced by the 4th (F).' },
        { t: 'mc', id: 'qr-2d', q: 'E5 contains…', o: ['E G# B', 'E G B', 'E and B only', 'E A B'], a: 2, ex: 'A “5” chord = root + 5th: no 3rd, so neither major nor minor.' },
        { t: 'mc', id: 'qr-2e', q: 'G7 vs Gmaj7: what is different?', o: ['The 3rd', 'The 7th (F vs F#)', 'The root', 'Nothing'], a: 1, ex: '“7” alone = minor 7th (F). “maj7” = major 7th (F#). Both chords are major.' },
      ],
      practice: { type: 'game', game: 'chordTones', title: 'Decode the chord', how: 'A chord name appears. Find the tone asked. Think: what does each symbol add?', types: ['maj', 'min', 'dom7', 'maj7', 'm7'] },
      jam: { prompt: 'Blues uses only “7” chords. Over each one, try landing on its b7.', style: 'blues', key: 'E', scale: 'blues', tone: 'Edge-of-breakup' },
    },
    {
      id: 'r-3', title: 'Reading tabs',
      cards: [
        { h: 'Six lines, upside down', p: 'Tab has 6 lines = 6 strings. Careful: the <b>top line is the high e</b> (thin string), the bottom is the low E. It’s the guitar as you see it when you look down at it.' },
        { h: 'Numbers = frets', p: 'A number tells you which fret to play on that line. <b>0</b> = open string. Read left to right. Numbers stacked on top of each other = play them together (a chord).', pre: TAB_RIFF },
        { h: 'Technique symbols', p: '<b>h</b> hammer-on · <b>p</b> pull-off · <b>/</b> slide up · <b>\\</b> slide down · <b>b</b> bend (7b9 = bend fret 7 until it sounds like fret 9) · <b>r</b> release · <b>~</b> vibrato · <b>x</b> muted hit.' },
        { h: 'What tab doesn’t show', p: 'Basic tab has <b>no rhythm</b>. Listen to the song to know how long each note lasts.' },
      ],
      quiz: [
        { t: 'mc', id: 'qr-3a', q: 'In tab, the top line is…', o: ['The low E string', 'The high e string', 'The G string', 'The first fret'], a: 1, ex: 'Top = high e. The opposite of what many people expect.' },
        { t: 'mc', id: 'qr-3b', q: '“5h7” means…', o: ['Fret 5 then hammer-on to 7', 'Hold 5 for 7 beats', 'Slide 5 to 7', 'Bend 5 to 7'], a: 0, ex: 'h = hammer-on.' },
        { t: 'mc', id: 'qr-3c', q: '“7b9” means…', o: ['Play 7 then 9', 'Bend fret 7 up to the pitch of fret 9', 'Slide from 7 to 9', 'Barre 7 to 9'], a: 1, ex: 'A whole-step bend (2 frets).' },
        { t: 'mc', id: 'qr-3d', q: 'A “0” on a line means…', o: ['Don’t play', 'Open string', 'Mute', 'Fret 10'], a: 1, ex: '0 = no finger, open string.' },
      ],
      practice: { type: 'drill', title: 'Play the tab riff', how: 'Read the riff from the lesson: open low E, A string 7, D string 5, D string 7 with a hammer-on to 9, then G string 7. (These notes come from E minor pentatonic, which you’ll learn later.) Loop it slowly.', bpm: 70, pre: TAB_RIFF },
      jam: { prompt: 'Start every phrase with the tab riff, then continue freely using the dots shown on the neck.', style: 'rock', key: 'E', scale: 'minorPent', tone: 'Crunch' },
    },
    {
      id: 'r-4', title: 'Sharps, flats and naturals',
      cards: [
        { h: '# and b', p: '<b>#</b> (sharp) raises a note one fret. <b>b</b> (flat) lowers it one fret. F# is the fret just above F; Bb is the fret just below B. They describe the <b>note</b>, not major or minor.' },
        { h: 'Two names, one fret', p: 'F# and Gb are the same fret. Same for C#/Db, D#/Eb, G#/Ab, A#/Bb. These are called <b>enharmonic</b> notes.' },
        { h: 'Which name to use?', p: 'In a scale, each letter is used <b>once</b>. F major is F G A <b>Bb</b> C D E (not A#), because A is already used. That’s why some keys use sharps and others flats.' },
        { h: 'Natural ♮', p: 'A natural sign cancels a sharp or flat: B♮ is just B. You’ll mostly see it in written music, rarely in tabs.' },
      ],
      quiz: [
        { t: 'mc', id: 'qr-4a', q: 'Which is the same note as Db?', o: ['D#', 'C#', 'C', 'Eb'], a: 1, ex: 'One fret below D = one fret above C.' },
        { t: 'mc', id: 'qr-4b', q: 'Why does F major use Bb and not A#?', o: ['It sounds different', 'Each letter is used once', 'A# doesn’t exist', 'Flats are always better'], a: 1, ex: 'F G A Bb C D E: every letter once.' },
        { t: 'mc', id: 'qr-4c', q: 'F#m is…', o: ['F major, sharp', 'A minor chord built on F#', 'F minor', 'F# major'], a: 1, ex: 'F# = the root note, m = minor.' },
      ],
      practice: { type: 'game', game: 'nameNote', strings: [0, 1, 2], from: 0, to: 12, title: 'Name the note (sharps and flats)', how: 'Both names are accepted. Notice which notes have two names.' },
      jam: { prompt: 'A key with flats: over this Bb backing, find the root Bb on the E and A strings first.', style: 'rock', key: 'Bb', scale: 'minorPent', tone: 'Crunch' },
    },
  ],
};

const CH_RHYTHM = {
  id: 'cT', title: 'Rhythm & Time', icon: '🥁',
  blurb: 'Beats, bars, note values, swing and groove. Rhythm is half of a great solo.',
  lessons: [
    {
      id: 't-1', title: 'Beats, bars and time signatures',
      cards: [
        { h: 'The beat', p: 'The <b>beat</b> is the pulse you tap your foot to. Tempo (BPM) = how many beats per minute.' },
        { h: 'Bars', p: 'Beats are grouped into <b>bars</b> (or measures). In most songs a bar has 4 beats: count “<b>1</b> 2 3 4, <b>1</b> 2 3 4”. Beat 1 is the strongest.' },
        { h: 'Time signatures', p: '<b>4/4</b>: 4 beats per bar (almost all rock/pop). <b>3/4</b>: 3 beats, a waltz feel. <b>6/8</b>: two big beats, each split in 3 (“<b>1</b> 2 3 <b>4</b> 5 6”). Top number = how many, bottom = which note value counts.' },
      ],
      quiz: [
        { t: 'mc', id: 'qt-1a', q: 'How many beats in a bar of 4/4?', o: ['2', '3', '4', '8'], a: 2, ex: 'The top number.' },
        { t: 'mc', id: 'qt-1b', q: 'Which time signature has a waltz feel?', o: ['4/4', '3/4', '2/4', '5/4'], a: 1, ex: '1 2 3, 1 2 3…' },
        { t: 'mc', id: 'qt-1c', q: 'Which beat of the bar is usually strongest?', o: ['1', '2', '3', '4'], a: 0, ex: 'Beat 1, “the one”.' },
      ],
      practice: { type: 'drill', title: 'Count out loud', how: 'Start the metronome. Strum one chord on beat 1 only, count “1 2 3 4” out loud. Then strum on 1 and 3. Then on all 4.', bpm: 80 },
      jam: { prompt: 'Count “1 2 3 4” in your head and start every phrase exactly on beat 1.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
    },
    {
      id: 't-2', title: 'Note values',
      cards: [
        { h: 'How long a note lasts', p: 'In 4/4: <b>whole note</b> = 4 beats · <b>half note</b> = 2 · <b>quarter note</b> = 1 · <b>eighth note</b> = ½ · <b>sixteenth note</b> = ¼.' },
        { h: 'Counting', p: 'Quarters: “1 2 3 4”. Eighths: “1 & 2 & 3 & 4 &”. Sixteenths: “1 e & a 2 e & a…”. Saying it out loud is the fastest way to get it in your hands.' },
        { h: 'Rests and dots', p: 'Every note value has a <b>rest</b> of the same length (silence). A <b>dot</b> adds half the value: a dotted half note = 3 beats.' },
      ],
      quiz: [
        { t: 'mc', id: 'qt-2a', q: 'How many eighth notes fit in a 4/4 bar?', o: ['4', '6', '8', '16'], a: 2, ex: '2 per beat × 4 beats.' },
        { t: 'mc', id: 'qt-2b', q: 'A dotted half note lasts…', o: ['2 beats', '3 beats', '4 beats', '1½ beats'], a: 1, ex: '2 + half of 2 = 3.' },
        { t: 'mc', id: 'qt-2c', q: 'How do you count sixteenth notes?', o: ['1 2 3 4', '1 & 2 &', '1 e & a', '1 la li'], a: 2, ex: '“1 e & a 2 e & a…”.' },
      ],
      practice: { type: 'drill', title: 'Subdivide', how: 'One note, metronome on. 4 bars of quarters, 4 bars of eighths, 4 bars of sixteenths, all alternate picking. Raise the tempo only when it’s even.', bpm: 70 },
      jam: { prompt: 'Rhythm only: use just 2 notes, and change the note values (long, eighths, sixteenths) to make it interesting.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
    },
    {
      id: 't-3', title: 'Triplets, swing and shuffle',
      cards: [
        { h: 'Triplets', p: 'A <b>triplet</b> fits 3 notes in the space of 2. Eighth-note triplets = 3 notes per beat: count “<b>1</b>-trip-let <b>2</b>-trip-let”.' },
        { h: 'Swing / shuffle', p: 'In a <b>shuffle</b>, eighth notes are played long-short (“daa-da daa-da”), using the 1st and 3rd note of each triplet. It’s the feel of the blues backing in the Studio.' },
        { h: 'Straight vs swung', p: 'Rock and pop are usually <b>straight</b> (even eighths). Blues, jazz and lots of funk/soul <b>swing</b>. Playing straight over a shuffle sounds stiff, so listen first.' },
      ],
      quiz: [
        { t: 'mc', id: 'qt-3a', q: 'A triplet is…', o: ['3 notes in the space of 2', '3 beats per bar', '3 strings at once', 'A note held 3 beats'], a: 0, ex: 'Three in the time of two.' },
        { t: 'mc', id: 'qt-3b', q: 'Shuffle eighths are played…', o: ['Even', 'Long-short', 'Short-long', 'As sixteenths'], a: 1, ex: 'Daa-da daa-da.' },
      ],
      practice: { type: 'drill', title: 'Straight vs shuffle', how: 'With the metronome: 8 bars of straight eighths (“1 & 2 &”), then 8 bars of shuffle (“1-a 2-a”, long-short). Feel the difference.', bpm: 76 },
      jam: { prompt: 'This is a shuffle. Make every eighth-note line swing (long-short).', style: 'blues', key: 'A', scale: 'blues', tone: 'Edge-of-breakup + spring reverb' },
    },
    {
      id: 't-4', title: 'Syncopation and groove',
      cards: [
        { h: 'Off the beat', p: '<b>Syncopation</b> = accenting the “&” (between the beats) instead of the beat itself. It creates movement and surprise.' },
        { h: 'Funk is 16ths', p: 'Funk guitar keeps the hand moving in 16ths and only hits some of them. The hand never stops, even when the strings are muted.' },
        { h: 'Groove', p: 'Groove = rhythm that makes people move. Playing a little <b>behind</b> the beat feels relaxed, a little <b>ahead</b> feels urgent. Good soloists phrase with rhythm as much as with notes.' },
      ],
      quiz: [
        { t: 'mc', id: 'qt-4a', q: 'Syncopation means accenting…', o: ['Only beat 1', 'Between the beats', 'Every note equally', 'Only the last bar'], a: 1, ex: 'The “&”s and off-beats.' },
        { t: 'mc', id: 'qt-4b', q: 'A funk strumming hand usually…', o: ['Stops between hits', 'Keeps moving in 16ths', 'Plays only downstrokes on 1', 'Plays triplets'], a: 1, ex: 'Constant motion, only some strokes hit.' },
      ],
      practice: { type: 'drill', title: 'Only the “&”', how: 'Metronome on. Count “1 & 2 & 3 & 4 &” and play a short chord ONLY on the “&”s. Keep your hand moving down-up.', bpm: 80 },
      jam: { prompt: 'Start your phrases on the “&” of beat 2 or 4 instead of on beat 1.', style: 'funk', key: 'A', scale: 'minorPent', tone: 'Clean, bright' },
    },
  ],
};

const CH_KEYS = {
  id: 'cK', title: 'Keys & the Circle of Fifths', icon: '🔑',
  blurb: 'Know which notes belong in a song, find its key in seconds, and move it anywhere.',
  lessons: [
    {
      id: 'k-1', title: 'Key signatures',
      cards: [
        { h: 'Every key has its sharps or flats', p: 'A key uses one major scale, so it has a fixed set of sharps or flats: its <b>key signature</b>. C major has none.' },
        { h: 'Sharp keys', p: 'G: 1# (F#) · D: 2# (F#, C#) · A: 3# · E: 4# · B: 5# · F#: 6#. They always come in this order: <b>F C G D A E B</b>.' },
        { h: 'Flat keys', p: 'F: 1b (Bb) · Bb: 2b (Bb, Eb) · Eb: 3b · Ab: 4b · Db: 5b. Order: <b>B E A D G C F</b> (the sharp order backwards).' },
      ],
      quiz: [
        { t: 'mc', id: 'qk-1a', q: 'How many sharps in D major?', o: ['1', '2', '3', '0'], a: 1, ex: 'F# and C#.' },
        { t: 'mc', id: 'qk-1b', q: 'Which key has one flat (Bb)?', o: ['C', 'F', 'G', 'Bb'], a: 1, ex: 'F G A Bb C D E.' },
        { t: 'mc', id: 'qk-1c', q: 'Which notes are sharp in A major?', o: ['F#', 'F# C#', 'F# C# G#', 'C# G# D#'], a: 2, ex: 'Three sharps, in the order F C G.' },
      ],
      practice: { type: 'drill', title: 'Play the sharp keys', how: 'Play the major scale (one octave) in G, D, A and E. Say the sharps out loud as you play them.', bpm: 70 },
      jam: { prompt: 'Key of E major (4 sharps). Use the major pentatonic and listen for the bright sound.', style: 'pop', key: 'E', scale: 'majorPent', tone: 'Clean + chorus' },
    },
    {
      id: 'k-2', title: 'The circle of fifths',
      cards: [
        { h: 'A map of all keys', p: 'Go up a 5th from C, again and again: <b>C → G → D → A → E → B → F#</b>. Each step adds one sharp.' },
        { h: 'The flat side', p: 'Go up a 4th (= down a 5th) from C: <b>C → F → Bb → Eb → Ab → Db → Gb</b>. Each step adds one flat. The two sides meet at F#/Gb.' },
        { h: 'Why it’s useful', p: 'Neighbouring keys share 6 of 7 notes, so songs move easily between them. And the chord one step <b>counter-clockwise</b> from a key is its IV, one step <b>clockwise</b> is its V: C’s neighbours are F and G.' },
      ],
      quiz: [
        { t: 'mc', id: 'qk-2a', q: 'One step clockwise from G is…', o: ['C', 'D', 'A', 'F'], a: 1, ex: 'Up a 5th: G → D.' },
        { t: 'mc', id: 'qk-2b', q: 'In the key of A, the IV and V chords are…', o: ['D and E', 'E and B', 'C and D', 'D and G'], a: 0, ex: 'Neighbours of A on the circle: D (IV) and E (V).' },
        { t: 'mc', id: 'qk-2c', q: 'Going counter-clockwise from C adds…', o: ['Sharps', 'Flats', 'Nothing', 'Minor chords'], a: 1, ex: 'F (1b), Bb (2b)…' },
      ],
      practice: { type: 'drill', title: 'Walk the circle', how: 'Play the chords C – G – D – A – E, one bar each, then back. Then C – F – Bb – Eb. Say the number of sharps/flats.', bpm: 70 },
      jam: { prompt: 'I–IV–V are neighbours on the circle. Solo over them in A.', style: 'blues', key: 'A', scale: 'minorPent', tone: 'Edge-of-breakup' },
    },
    {
      id: 'k-3', title: 'Finding the key of a song',
      cards: [
        { h: 'Look at the chords', p: 'Find the major scale that contains all (or almost all) the chords. Songs often <b>start and end on the I</b>, the chord that feels like home.' },
        { h: 'Major or minor key?', p: 'If the “home” chord is minor (Am in a C-family song), the song is in the relative minor (A minor). Same notes, different home.' },
        { h: 'Common exceptions', p: 'Minor songs often borrow a <b>major V</b> (E instead of Em in A minor) for a stronger pull home. Blues uses 7 chords everywhere. Trust your ear: which chord feels like the end?' },
      ],
      quiz: [
        { t: 'mc', id: 'qk-3a', q: 'Chords: G, C, D, Em. Key?', o: ['C major', 'G major', 'D major', 'E minor only'], a: 1, ex: 'G=I, C=IV, D=V, Em=vi.' },
        { t: 'mc', id: 'qk-3b', q: 'Chords: Am, F, C, G, ending on Am. Key?', o: ['C major', 'A minor', 'F major', 'G major'], a: 1, ex: 'C-family chords, but home is Am.' },
        { t: 'mc', id: 'qk-3c', q: 'Am, Dm, E, Am. Why is E major there?', o: ['Mistake', 'Borrowed major V for a stronger pull home', 'It’s a different key', 'E is the key'], a: 1, ex: 'Its G# pulls up to A.' },
      ],
      practice: { type: 'drill', title: 'Find the key', how: 'Pick 3 songs you know. Write their chords, find the scale that contains them, and play that scale over the song.', bpm: 70 },
      jam: { prompt: 'Find the key by ear: listen to 2 rounds of the backing, find the note that sounds like home, then solo.', style: 'pop', key: 'D', scale: 'majorPent', tone: 'Clean' },
    },
    {
      id: 'k-4', title: 'Transposing and the capo',
      cards: [
        { h: 'Transposing', p: 'To move a song to another key, move <b>every chord by the same distance</b>. G C D up 2 frets = A D E. With numbers (I IV V) it’s instant.' },
        { h: 'The capo', p: 'A capo raises every open string. Play G shapes with a capo on fret 2 and it sounds in <b>A</b>. You keep easy shapes and match any singer.' },
        { h: 'Capo maths', p: 'Sounding chord = shape + capo fret. C shape, capo 3 = Eb. To reach a key, count frets from your shape’s key to the target.' },
      ],
      quiz: [
        { t: 'mc', id: 'qk-4a', q: 'G – C – D moved up 2 frets becomes…', o: ['A – D – E', 'A – C – E', 'B – E – F#', 'F – Bb – C'], a: 0, ex: 'Each chord + 2 half steps.' },
        { t: 'mc', id: 'qk-4b', q: 'C shape with capo on fret 2 sounds as…', o: ['C', 'D', 'E', 'Bb'], a: 1, ex: 'C + 2 = D.' },
        { t: 'mc', id: 'qk-4c', q: 'You want to play in A using G shapes. Capo on…', o: ['Fret 1', 'Fret 2', 'Fret 3', 'Fret 5'], a: 1, ex: 'G to A = 2 frets.' },
      ],
      practice: { type: 'drill', title: 'Transpose a song', how: 'Take a song you know with open chords. Play it in its key, then in a key 2 frets higher using barre chords, then with a capo on 2.', bpm: 70 },
      jam: { prompt: 'Same riff, different key: play an idea in A, then repeat it exactly 2 frets higher.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
    },
  ],
};

const CH_MORECHORDS = {
  id: 'cM', title: 'More Chords', icon: '🧩',
  blurb: 'Power chords, sus, add9, diminished, inversions and the CAGED system.',
  lessons: [
    {
      id: 'm-1', title: 'Power chords',
      cards: [
        { h: 'Root + 5th', p: 'A power chord (A5, E5…) has only the root and the 5th, often doubled with the octave. <b>No 3rd</b>, so it is neither major nor minor.' },
        { h: 'The shape', p: 'Root on the E or A string, 5th two frets up on the next string, octave on the string after. Move it anywhere.', fb: { from: 3, to: 9, marks: () => [{ s: 0, f: 5, label: 'R', root: true }, { s: 1, f: 7, label: '5' }, { s: 2, f: 7, label: 'R', root: true }] } },
        { h: 'Why rock loves them', p: 'With distortion, full chords get muddy. Two clean notes stay tight and powerful.' },
      ],
      quiz: [
        { t: 'mc', id: 'qm-1a', q: 'Which notes are in G5?', o: ['G B D', 'G D', 'G Bb D', 'G C D'], a: 1, ex: 'Root + 5th.' },
        { t: 'mc', id: 'qm-1b', q: 'Is a power chord major or minor?', o: ['Major', 'Minor', 'Neither: it has no 3rd', 'Depends on the fret'], a: 2, ex: 'The 3rd decides major/minor, and it’s missing.' },
      ],
      practice: { type: 'drill', title: 'Power chord riff', how: 'Root on the low E: frets 5 – 3 – 8 – 7 (A5 G5 C5 B5)… then make your own. Mute the other strings with your fretting fingers.', bpm: 90 },
      jam: { prompt: 'Rhythm guitar: play power chords along with the backing, then solo for 4 bars, then back to riffs.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'High gain' },
    },
    {
      id: 'm-2', title: 'Sus and add chords',
      cards: [
        { h: 'Suspended chords', p: '<b>sus2</b> = 1 2 5, <b>sus4</b> = 1 4 5. The 3rd is gone, replaced by the 2nd or 4th. They sound open and unresolved; sus4 loves to resolve back to the major chord.', box: { root: 2, frets: [-1,-1,0,2,3,3], fingers: [0,0,0,1,2,3], label: 'Dsus4' } },
        { h: 'Try it', p: 'Play D, then Dsus4 (add your pinky on the high e, fret 3), then back to D. That little move is in countless songs.', box: { root: 2, frets: [-1,-1,0,2,3,0], fingers: [0,0,0,1,3,0], label: 'Dsus2' } },
        { h: 'add9 and 6', p: '<b>add9</b> = major chord + the 9th (the 2nd an octave up): it keeps the 3rd, sounds rich. <b>6</b> chords add the 6th: warm, retro.', box: { root: 0, frets: [-1,3,2,0,3,0], fingers: [0,2,1,0,3,0], label: 'Cadd9' } },
      ],
      quiz: [
        { t: 'mc', id: 'qm-2a', q: 'Dsus2 contains…', o: ['D F# A', 'D E A', 'D G A', 'D F A'], a: 1, ex: '1 2 5 of D.' },
        { t: 'mc', id: 'qm-2b', q: 'What is the difference between Cadd9 and Csus2?', o: ['None', 'Cadd9 keeps the 3rd (E)', 'Csus2 has a 7th', 'Cadd9 has no 5th'], a: 1, ex: 'sus replaces the 3rd, add keeps it.' },
        { t: 'mc', id: 'qm-2c', q: 'A sus4 chord usually wants to…', o: ['Stay forever', 'Resolve to the major chord', 'Go to the minor chord', 'Go up a 5th'], a: 1, ex: 'The 4th falls to the 3rd.' },
      ],
      practice: { type: 'drill', title: 'D – Dsus4 – D – Dsus2', how: 'Loop D → Dsus4 → D → Dsus2 → D, one beat each. Then A → Asus4 → A → Asus2.', bpm: 80 },
      jam: { prompt: 'Comping with colour: play the chords with sus and add9 touches, then a short melody on top.', style: 'pop', key: 'D', scale: 'majorPent', tone: 'Clean + chorus' },
    },
    {
      id: 'm-3', title: 'Diminished and augmented',
      cards: [
        { h: 'Diminished', p: '<b>dim</b> = 1 b3 b5. Tense and unstable. It’s the vii° chord of every major key (Bdim in C). <b>dim7</b> adds a 6th on top: four notes, all a minor 3rd apart.', chord: [11, 'dim', 'A'] },
        { h: 'Augmented', p: '<b>aug</b> (+) = 1 3 #5. Dreamy, suspenseful, like something is about to happen. Often used to move from I to IV.', box: { root: 0, frets: [-1,3,2,1,1,0], fingers: [0,3,2,1,1,0], label: 'Caug' } },
        { h: 'How to use them', p: 'Use them as <b>passing chords</b>: C – C#dim – Dm, or C – Caug – F. Short and on the way somewhere.' },
      ],
      quiz: [
        { t: 'mc', id: 'qm-3a', q: 'Bdim contains…', o: ['B D F', 'B D# F#', 'B D F#', 'B D# G'], a: 0, ex: '1 b3 b5 of B.' },
        { t: 'mc', id: 'qm-3b', q: 'Caug contains…', o: ['C E G', 'C E G#', 'C Eb Gb', 'C F G'], a: 1, ex: 'The 5th is raised: G → G#.' },
      ],
      practice: { type: 'drill', title: 'Passing chords', how: 'Play C – C#dim – Dm – G, one bar each. Then C – Caug – F. Hear how the strange chords pull to the next one.', bpm: 70 },
      jam: { prompt: 'Use the tritone (b5) as a passing note in your phrases, never as a resting note.', style: 'blues', key: 'A', scale: 'blues', tone: 'Edge-of-breakup' },
    },
    {
      id: 'm-4', title: 'Inversions and slash chords',
      cards: [
        { h: 'Change the bass note', p: 'Root position: the root is the lowest note. <b>1st inversion</b>: the 3rd in the bass (C/E). <b>2nd inversion</b>: the 5th in the bass (C/G). Same chord, different colour.', box: { root: 0, frets: [0,3,2,0,1,0], fingers: [0,3,2,0,1,0], label: 'C/E' } },
        { h: 'Walking bass lines', p: 'Inversions make the bass move smoothly: <b>C – G/B – Am</b> (C, B, A walking down). Huge in pop and ballads.', box: { root: 7, frets: [-1,2,0,0,0,3], fingers: [0,1,0,0,0,3], label: 'G/B' } },
        { h: 'Reading them', p: 'A slash chord = chord / bass note. D/F# = D chord with F# at the bottom (often played with the thumb on the low E).' },
      ],
      quiz: [
        { t: 'mc', id: 'qm-4a', q: 'C/E is C major with…', o: ['E on top', 'E in the bass', 'E added as a 9th', 'E removed'], a: 1, ex: 'Slash = bass note.' },
        { t: 'mc', id: 'qm-4b', q: 'G/B is which inversion of G?', o: ['Root position', '1st inversion (3rd in bass)', '2nd inversion (5th in bass)', 'Not an inversion'], a: 1, ex: 'B is the 3rd of G.' },
      ],
      practice: { type: 'drill', title: 'Walking down', how: 'Play C – G/B – Am – Am/G – F, one bar each. Focus on the bass notes walking down: C B A G F.', bpm: 70 },
      jam: { prompt: 'Make the lowest note of each phrase follow the chord roots. Then try ending on the 3rd instead.', style: 'ballad', key: 'C', scale: 'majorPent', tone: 'Clean + delay' },
    },
    {
      id: 'm-5', title: 'The CAGED system',
      cards: [
        { h: 'Five shapes', p: 'The open chords <b>C, A, G, E, D</b> can all be moved up the neck as barre shapes. Together they cover the whole neck.' },
        { h: 'One chord, five places', p: 'C major can be played as: the open <b>C</b> shape, the <b>A</b> shape at fret 3, the <b>G</b> shape around fret 5, the <b>E</b> shape at fret 8, the <b>D</b> shape at fret 10. Then it repeats.', fb: { from: 0, to: 12, marks: () => marksFor([0, 4, 7], 0, 0, 12) } },
        { h: 'Why it matters for solos', p: 'Each shape sits on top of a scale position. Know where the chord is, and the scale notes (and target notes) are right around it.' },
      ],
      quiz: [
        { t: 'mc', id: 'qm-5a', q: 'What does CAGED stand for?', o: ['5 scales', '5 open chord shapes', '5 strings', '5 keys'], a: 1, ex: 'C, A, G, E and D shapes.' },
        { t: 'mc', id: 'qm-5b', q: 'An E-shape barre with the root on fret 8 of the low E gives…', o: ['A', 'B', 'C', 'D'], a: 2, ex: 'Low E fret 8 = C.' },
      ],
      practice: { type: 'game', game: 'chordTones', title: 'Chord tones anywhere', how: 'Find the root, 3rd or 5th all over the neck: that’s the CAGED map in your head.', types: ['maj'] },
      jam: { prompt: 'Play the same chord in 3 different places on the neck as the backing loops, then solo around each shape.', style: 'pop', key: 'C', scale: 'majorPent', tone: 'Clean + chorus' },
    },
  ],
};

const EXTRA_TARGET_LESSONS = [
  {
    id: 'l6-3', title: 'Arpeggio shapes',
    cards: [
      { h: 'Chords, one note at a time', p: 'An <b>arpeggio</b> plays the notes of a chord separately. Over a chord, its arpeggio is the safest, most “in” sound there is.' },
      { h: 'Minor arpeggio (root on the low E)', p: 'A minor arpeggio around fret 5: A C E only. Roots in gold.', fb: { from: 4, to: 9, marks: () => marksFor([9, 0, 4], 9, 5, 8) } },
      { h: 'Major arpeggio', p: 'A major arpeggio: A C# E. Compare: only the 3rd changes (C → C#).', fb: { from: 3, to: 8, marks: () => marksFor([9, 1, 4], 9, 4, 7) } },
    ],
    quiz: [
      { t: 'mc', id: 'q6-3a', q: 'An arpeggio is…', o: ['A fast scale', 'The notes of a chord played one by one', 'A bend', 'A strumming pattern'], a: 1, ex: 'Chord tones, separately.' },
      { t: 'mc', id: 'q6-3b', q: 'Notes of the E minor arpeggio?', o: ['E G B', 'E G# B', 'E A B', 'E G Bb'], a: 0, ex: '1 b3 5.' },
    ],
    practice: { type: 'drill', title: 'Arpeggios up and down', how: 'Play the A minor arpeggio (frets 5–8) up and down, then the A major one (frets 4–7). Slowly, each note clean.', bpm: 70, fb: { from: 4, to: 9, marks: () => marksFor([9, 0, 4], 9, 5, 8) } },
    jam: { prompt: 'Over each chord, play a few notes of its arpeggio, then connect with scale notes.', style: 'rock', key: 'A', scale: 'minor', tone: 'Crunch', target: true },
  },
  {
    id: 'l6-4', title: 'Tension and resolution',
    cards: [
      { h: 'V wants to go to I', p: 'The <b>V</b> chord pulls strongly to the <b>I</b>. G → C in C major. V7 (G7) pulls even harder.' },
      { h: 'Why: the leading tone', p: 'G7 contains B (the 7th of the scale) and F (the 4th). B wants to rise to C, F wants to fall to E. Two notes moving by a half step = the strongest “home” feeling.' },
      { h: 'Cadences', p: '<b>V → I</b>: “the end” (authentic). <b>IV → I</b>: softer, “amen” (plagal). <b>V → vi</b>: surprise, the music goes somewhere unexpected (deceptive).' },
    ],
    quiz: [
      { t: 'mc', id: 'q6-4a', q: 'In C major, which chord pulls hardest to C?', o: ['F', 'G7', 'Am', 'Em'], a: 1, ex: 'V7 → I.' },
      { t: 'mc', id: 'q6-4b', q: 'V → vi is called…', o: ['Authentic', 'Plagal', 'Deceptive', 'Perfect'], a: 2, ex: 'You expect I, you get vi.' },
      { t: 'mc', id: 'q6-4c', q: 'Which note of G7 wants to rise to C?', o: ['G', 'B', 'D', 'F'], a: 1, ex: 'B is the leading tone, a half step below C.' },
    ],
    practice: { type: 'drill', title: 'Feel the pull', how: 'Play G7 and stop. Feel the tension? Now play C. Then try G7 → Am (deceptive) and F → C (plagal).', bpm: 70 },
    jam: { prompt: 'When the V chord comes, play the leading tone (7th of the key) and resolve it up to the root on the I.', style: 'pop', key: 'G', scale: 'major', tone: 'Clean', target: true },
  },
];

const CH_MODES = {
  id: 'c7', title: 'Modes', icon: '🌈',
  blurb: 'Dorian, Mixolydian and friends: new colours from the same notes.',
  lessons: [
    {
      id: 'l7-1', title: 'What is a mode?',
      cards: [
        { h: 'Same notes, new home', p: 'Play the C major scale but start and end on D: you get <b>D Dorian</b>. Start on each note and you get 7 modes, each with its own mood.' },
        { h: 'The seven', p: 'C <b>Ionian</b> (= major) · D <b>Dorian</b> · E <b>Phrygian</b> · F <b>Lydian</b> · G <b>Mixolydian</b> · A <b>Aeolian</b> (= natural minor) · B <b>Locrian</b>.' },
        { h: 'Think in colours', p: 'Compare each mode to major or minor: Dorian = minor with a <b>6</b> · Phrygian = minor with a <b>b2</b> · Lydian = major with a <b>#4</b> · Mixolydian = major with a <b>b7</b>. That one note is the colour.' },
      ],
      quiz: [
        { t: 'mc', id: 'q7-1a', q: 'The C major scale started on G is…', o: ['G Dorian', 'G Mixolydian', 'G Lydian', 'G major'], a: 1, ex: 'G is the 5th degree → Mixolydian.' },
        { t: 'mc', id: 'q7-1b', q: 'Aeolian is another name for…', o: ['Major', 'Natural minor', 'Blues scale', 'Dorian'], a: 1, ex: 'The 6th mode.' },
        { t: 'mc', id: 'q7-1c', q: 'Lydian is major with a…', o: ['b7', '#4', 'b3', 'b2'], a: 1, ex: 'The raised 4th.' },
      ],
      practice: { type: 'drill', title: 'Hear the modes', how: 'Play C major from C to C, then the same notes from D to D, from G to G, from A to A. Hold the starting note at the end and listen to the mood.', bpm: 70 },
      jam: { prompt: 'Over this minor vamp, use only the notes of the C major scale but always return to A. You are playing A Aeolian.', style: 'rock', key: 'A', scale: 'minor', tone: 'Crunch' },
    },
    {
      id: 'l7-2', title: 'Dorian: minor with a bright 6',
      cards: [
        { h: 'The formula', p: 'Dorian = <b>1 2 b3 4 5 6 b7</b>. Natural minor has a b6; Dorian raises it to a 6. Minor, but hopeful and funky.' },
        { h: 'Easy way in', p: 'Take minor pentatonic (1 b3 4 5 b7) and add the <b>2</b> and the <b>6</b>. In A: add B and F#.', fb: { from: 4, to: 9, marks: () => scaleMarks('A', 'dorian', 5, 8) } },
        { h: 'When to use it', p: 'Over a minor 7 chord vamp (Am7 – D7), funk, soul and Latin rock. Lean on the 6 (F# in A) to show the colour.' },
      ],
      quiz: [
        { t: 'mc', id: 'q7-2a', q: 'Which note makes A Dorian different from A natural minor?', o: ['F# instead of F', 'C# instead of C', 'G# instead of G', 'Bb instead of B'], a: 0, ex: 'The 6th: F → F#.' },
        { t: 'mc', id: 'q7-2b', q: 'D Dorian has the same notes as…', o: ['D major', 'C major', 'F major', 'G major'], a: 1, ex: 'D is the 2nd degree of C.' },
      ],
      practice: { type: 'drill', title: 'Dorian position', how: 'Play A Dorian around fret 5. Then play minor pentatonic and add F# on purpose in each phrase.', bpm: 70, fb: { from: 4, to: 9, marks: () => scaleMarks('A', 'dorian', 5, 8) } },
      jam: { prompt: 'Dorian vamp: use the 6th (the note that makes it Dorian) at least once in every phrase.', style: 'funk', key: 'A', scale: 'dorian', tone: 'Clean, bright' },
    },
    {
      id: 'l7-3', title: 'Mixolydian: major with a bluesy b7',
      cards: [
        { h: 'The formula', p: 'Mixolydian = <b>1 2 3 4 5 6 b7</b>. A major scale with a lowered 7th: happy, but with attitude.' },
        { h: 'Where it lives', p: 'It fits <b>dominant 7 chords</b> perfectly (A7 → A Mixolydian). Classic rock, country, blues in a major mood.', fb: { from: 4, to: 9, marks: () => scaleMarks('A', 'mixolydian', 4, 7) } },
        { h: 'Mix it with the blues', p: 'Great trick over a blues: alternate minor pentatonic (gritty) with Mixolydian (sweet). Watch the 3rd: C (minor) vs C# (major).' },
      ],
      quiz: [
        { t: 'mc', id: 'q7-3a', q: 'Mixolydian fits best over…', o: ['m7 chords', 'Dominant 7 chords', 'maj7 chords', 'dim chords'], a: 1, ex: 'Its b7 matches the chord’s b7.' },
        { t: 'mc', id: 'q7-3b', q: 'G Mixolydian has the same notes as…', o: ['G major', 'C major', 'D major', 'F major'], a: 1, ex: 'G is the 5th degree of C.' },
      ],
      practice: { type: 'drill', title: 'Mixolydian position', how: 'Play A Mixolydian around fret 4–7. Emphasize C# (3) and G (b7).', bpm: 70, fb: { from: 3, to: 8, marks: () => scaleMarks('A', 'mixolydian', 4, 7) } },
      jam: { prompt: 'Blues in A: 4 bars of minor pentatonic, 4 bars of Mixolydian. Hear the switch.', style: 'blues', key: 'A', scale: 'mixolydian', tone: 'Edge-of-breakup + spring reverb' },
    },
    {
      id: 'l7-4', title: 'Lydian and Phrygian',
      cards: [
        { h: 'Lydian: dreamy', p: 'Lydian = <b>1 2 3 #4 5 6 7</b>. The #4 floats: film music, dream-like ballads. Use it over maj7 chords.', fb: { from: 6, to: 11, marks: () => scaleMarks('C', 'lydian', 7, 10) } },
        { h: 'Phrygian: dark', p: 'Phrygian = <b>1 b2 b3 4 5 b6 b7</b>. The b2 right above the root gives a dark, Spanish or metal sound.', fb: { from: 0, to: 4, marks: () => scaleMarks('E', 'phrygian', 0, 3) } },
        { h: 'Use them as spice', p: 'You don’t need them every day. But knowing they exist explains a lot of the sounds you hear in songs and film scores.' },
      ],
      quiz: [
        { t: 'mc', id: 'q7-4a', q: 'Which mode has a b2?', o: ['Lydian', 'Dorian', 'Phrygian', 'Mixolydian'], a: 2, ex: 'Phrygian: 1 b2 b3…' },
        { t: 'mc', id: 'q7-4b', q: 'F Lydian has the same notes as…', o: ['F major', 'C major', 'Bb major', 'G major'], a: 1, ex: 'F is the 4th degree of C.' },
      ],
      practice: { type: 'drill', title: 'Spot the colour note', how: 'Play E Phrygian on the low strings (open E, then F!). Then C Lydian around fret 8, landing on F#.', bpm: 70 },
      jam: { prompt: 'Dreamy: on the major chords, try touching the #4 then resolving to the 5th.', style: 'ballad', key: 'C', scale: 'lydian', tone: 'Clean + delay + big reverb' },
    },
    {
      id: 'l7-5', title: 'Choosing the right sound',
      cards: [
        { h: 'Match the chord', p: '<b>m7</b> chord → Dorian (or Aeolian, minor pentatonic) · <b>7</b> chord → Mixolydian (or blues) · <b>maj7</b> chord → Ionian or Lydian · minor chord in a sad song → Aeolian.' },
        { h: 'Follow the changes', p: 'When the chords change, the best scale can change too. Over Am7 – D7: A Dorian contains both chords’ notes, so one scale works for both.' },
        { h: 'Ears first', p: 'Theory tells you what will fit. Your ear tells you what you like. Try two options over the same backing and choose.' },
      ],
      quiz: [
        { t: 'mc', id: 'q7-5a', q: 'Over a long Dm7 vamp, a good first choice is…', o: ['D Mixolydian', 'D Dorian', 'D Lydian', 'D major'], a: 1, ex: 'm7 → Dorian.' },
        { t: 'mc', id: 'q7-5b', q: 'Over E7, a good choice is…', o: ['E Mixolydian', 'E Phrygian', 'E Lydian', 'E Locrian'], a: 0, ex: 'Dominant 7 → Mixolydian.' },
      ],
      practice: { type: 'drill', title: 'Two scales, one backing', how: 'In the Studio, pick a backing and switch the scale view between two options. Play 8 bars with each and choose your favourite.', bpm: 70 },
      jam: { prompt: 'This is a maj7 groove. Try major scale, then Lydian. Which one do you prefer?', style: 'soul', key: 'C', scale: 'major', tone: 'Warm clean, neck pickup' },
    },
  ],
};

const CH_PHRASING = {
  id: 'c8', title: 'Phrasing', icon: '🗣️',
  blurb: 'Bends, vibrato, legato, motifs, space: how to make notes talk.',
  lessons: [
    {
      id: 'l8-1', title: 'Bends and vibrato',
      cards: [
        { h: 'Bend to a pitch', p: 'A bend raises the note to a <b>target pitch</b>. Whole-step bend = the sound of 2 frets higher. Check: play the target fret, then bend until it matches.' },
        { h: 'Use 3 fingers', p: 'Bend with the ring finger, helped by the middle and index behind it. Push from the wrist, not the fingertip.' },
        { h: 'Vibrato', p: 'Vibrato = small, regular bends on a held note. It makes a note sing. Slow and wide = bluesy; fast and narrow = intense.' },
      ],
      quiz: [
        { t: 'mc', id: 'q8-1a', q: 'A whole-step bend on fret 7 should sound like…', o: ['Fret 8', 'Fret 9', 'Fret 10', 'Fret 12'], a: 1, ex: '2 frets higher.' },
        { t: 'mc', id: 'q8-1b', q: 'Vibrato is…', o: ['A fast scale', 'Small repeated bends on one note', 'A slide', 'Palm muting'], a: 1, ex: 'It makes long notes sing.' },
      ],
      practice: { type: 'drill', title: 'In-tune bends', how: 'G string fret 9: play fret 9, then fret 7 bent up until it sounds exactly like 9. 10 times. Then add vibrato to the bent note.', bpm: 60 },
      jam: { prompt: 'Every phrase ends with a bend or a long note with vibrato. No naked endings.', style: 'blues', key: 'A', scale: 'minorPent', tone: 'Edge-of-breakup + spring reverb' },
    },
    {
      id: 'l8-2', title: 'Legato: hammer-ons, pull-offs, slides',
      cards: [
        { h: 'Fewer picks, smoother lines', p: '<b>Hammer-on</b>: pick a note, then slam a finger on a higher fret. <b>Pull-off</b>: pick a note, pull the finger off sideways to sound a lower fret.' },
        { h: 'Slides', p: 'Slide into a note from 1–2 frets below to make it vocal. Slide between positions to travel across the neck smoothly.' },
        { h: 'Mix picked and legato', p: 'Picking = attack and accents. Legato = flow. Great phrases mix both.' },
      ],
      quiz: [
        { t: 'mc', id: 'q8-2a', q: 'A pull-off goes from…', o: ['Lower to higher fret', 'Higher to lower fret', 'One string to another', 'Open to fretted'], a: 1, ex: 'You pull off to a lower note.' },
        { t: 'mc', id: 'q8-2b', q: 'Why use legato?', o: ['Louder', 'Smoother, flowing lines', 'More distortion', 'Easier tuning'], a: 1, ex: 'Fewer pick attacks.' },
      ],
      practice: { type: 'drill', title: 'Legato pentatonic', how: 'A minor pentatonic box 1: pick only the first note on each string, hammer-on the second. Then down with pull-offs.', bpm: 70, fb: { from: 4, to: 9, marks: () => scaleMarks('A', 'minorPent', 5, 8) } },
      jam: { prompt: 'Play phrases where at least half the notes are hammer-ons, pull-offs or slides.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
    },
    {
      id: 'l8-3', title: 'Motifs and call & response',
      cards: [
        { h: 'A motif', p: 'A <b>motif</b> is a short idea (3–5 notes). Great solos repeat a motif and change it a little: other notes, other rhythm, other octave.' },
        { h: 'Call and response', p: 'Play a phrase that sounds like a <b>question</b> (ends on a tense note), then an <b>answer</b> (ends on the root or a chord tone).' },
        { h: 'Why it works', p: 'Repetition makes the listener follow you. Variation keeps them surprised. Random notes do neither.' },
      ],
      quiz: [
        { t: 'mc', id: 'q8-3a', q: 'A motif is…', o: ['A long scale run', 'A short musical idea you repeat and vary', 'A chord', 'A tempo'], a: 1, ex: 'Short, memorable, developed.' },
        { t: 'mc', id: 'q8-3b', q: 'An “answer” phrase usually ends on…', o: ['A tense note', 'The root or a chord tone', 'A muted note', 'The highest note'], a: 1, ex: 'It resolves.' },
      ],
      practice: { type: 'drill', title: 'One motif, five versions', how: 'Make a 4-note motif. Play it 5 ways: same, rhythm changed, one note changed, an octave up, backwards.', bpm: 70 },
      jam: { prompt: 'Question / answer for the whole take: 2 bars question, 2 bars answer.', style: 'blues', key: 'E', scale: 'minorPent', tone: 'Edge-of-breakup' },
    },
    {
      id: 'l8-4', title: 'Space, dynamics and rhythm',
      cards: [
        { h: 'Silence is part of the solo', p: 'Leave space between phrases. It lets the band breathe and makes your next phrase hit harder.' },
        { h: 'Dynamics', p: 'Play some phrases soft and some loud: with your picking hand, or with the volume knob. Same notes, totally different effect.' },
        { h: 'Rhythm over speed', p: 'A few notes with a strong rhythm beat a fast run with no shape. Repeat a rhythm, then break it.' },
      ],
      quiz: [
        { t: 'mc', id: 'q8-4a', q: 'Why leave space between phrases?', o: ['To rest the hands only', 'So phrases breathe and hit harder', 'Because the backing is loud', 'It’s a beginner thing'], a: 1, ex: 'Space is musical.' },
        { t: 'mc', id: 'q8-4b', q: 'Dynamics means…', o: ['Speed', 'Changes in loudness', 'Distortion', 'Key changes'], a: 1, ex: 'Soft vs loud.' },
      ],
      practice: { type: 'drill', title: 'Soft–loud', how: 'Play the same phrase 4 times: very soft, medium, loud, very loud. Then a solo where each phrase has a different dynamic.', bpm: 70 },
      jam: { prompt: 'At least one full bar of silence after every phrase. Make each phrase count.', style: 'ballad', key: 'G', scale: 'majorPent', tone: 'Clean + delay + big reverb' },
    },
    {
      id: 'l8-5', title: 'Building a solo',
      cards: [
        { h: 'Tell a story', p: 'A good solo has a shape: <b>start</b> simple and low, <b>develop</b> with motifs and more movement, reach a <b>peak</b> (higher, louder, faster), then <b>resolve</b>.' },
        { h: 'Your toolbox', p: 'Target chord tones on the changes · motifs and call & response · bends and vibrato on long notes · space · one or two fast runs, not twenty.' },
        { h: 'Record, listen, repeat', p: 'Record your solo, listen back in the Journal, and note one thing to improve next time. That loop is how solos get fluid.' },
      ],
      quiz: [
        { t: 'mc', id: 'q8-5a', q: 'A good place for the peak of a solo is…', o: ['The first bar', 'Near the end, before resolving', 'Never', 'Every bar'], a: 1, ex: 'Build up to it.' },
        { t: 'mc', id: 'q8-5b', q: 'The best way to improve your solos is…', o: ['Learn more scales only', 'Record, listen back, adjust', 'Play faster', 'Change guitar'], a: 1, ex: 'Feedback loop.' },
      ],
      practice: { type: 'drill', title: 'Plan your solo', how: 'Plan 16 bars: bars 1–4 low and simple, 5–8 develop a motif, 9–12 climb to the peak, 13–16 resolve on the root. Then play it.', bpm: 80 },
      jam: { prompt: 'Your final exam: a full solo with a beginning, a build-up, a peak and an ending. Record it and compare it with your first takes in the Journal.', style: 'blues', key: 'A', scale: 'blues', tone: 'Your favourite lead tone' },
    },
  ],
};


// ---------- Big-picture lessons for absolute beginners (v1.6) ----------
const LESSON_WHAT_IS_SCALE = {
  id: 'l3-0', title: 'What is a scale?',
  cards: [
    { h: 'A scale = a set of notes', p: 'Out of the 12 notes, a <b>scale</b> keeps only some of them, played in order from a starting note (the <b>root</b>) up to the same note an octave higher. Think of it as a <b>palette</b>: the colours you’re allowed to use.' },
    { h: 'Why scales matter', p: 'Notes from the same scale sound good together. The melody, the solo and most chords of a song come from <b>one scale</b>. When people say “solo in A minor pentatonic”, it means: only use the notes of that scale.' },
    { h: 'Scale vs key', p: 'The <b>key</b> of a song = which scale it uses + which note feels like home. “This song is in G major” = it uses the notes of the G major scale, and G is home.' },
    { h: 'Different scales, different moods', p: 'Keep different notes and the mood changes: <b>major</b> (happy, bright), <b>minor</b> (sad, dark), <b>pentatonic</b> (5 notes, almost impossible to sound wrong), <b>blues</b> (gritty). You’ll learn them one by one.' },
    { h: 'Hear one', p: 'Here is the C major scale on one string: C D E F G A B C. Tap the dots from left to right: do, re, mi…', fb: { from: 2, to: 15, marks: () => marksFor([0,2,4,5,7,9,11], 0, 3, 15, [1]) } },
  ],
  quiz: [
    { t: 'mc', id: 'q3-0a', q: 'A scale is…', o: ['A chord with 7 notes', 'A set of notes played in order from a root', 'A strumming pattern', 'A type of guitar'], a: 1, ex: 'A selection of notes, in order, from the root to its octave.' },
    { t: 'mc', id: 'q3-0b', q: '“The song is in A minor” means…', o: ['It only uses the A minor chord', 'It uses the A minor scale and A feels like home', 'It is slow', 'It has no major chords'], a: 1, ex: 'Key = scale + home note.' },
    { t: 'mc', id: 'q3-0c', q: 'The root of the G major scale is…', o: ['C', 'D', 'G', 'B'], a: 2, ex: 'The note it starts from and is named after.' },
    { t: 'mc', id: 'q3-0d', q: 'Why do soloists use scales?', o: ['To play faster', 'Their notes sound good together over the song', 'Because tabs require it', 'To tune the guitar'], a: 1, ex: 'Same palette as the song.' },
  ],
  practice: { type: 'drill', title: 'C major on one string', how: 'On the A string: frets 3 – 5 – 7 – 8 – 10 – 12 – 14 – 15. Sing “do re mi fa sol la ti do” as you play. Notice the two short steps (7→8 and 14→15).', bpm: 60, fb: { from: 2, to: 15, marks: () => marksFor([0,2,4,5,7,9,11], 0, 3, 15, [1]) } },
  jam: { prompt: 'Use only the dots shown on the neck (C major). Play slowly and listen: every note fits.', style: 'pop', key: 'C', scale: 'major', tone: 'Clean + chorus' },
};

const LESSON_SCALE_FAMILY = {
  id: 'l5-5', title: 'The scale family: the big picture',
  cards: [
    { h: 'They’re all related', p: 'The <b>major scale</b> (7 notes) is the parent. <b>Natural minor</b> = the same notes started from the 6th. <b>Pentatonics</b> = 5-note versions with the 2 “risky” notes removed. <b>Blues</b> = minor pentatonic + 1 extra note. <b>Modes</b> (later) = the major scale started on other notes.' },
    { h: 'Side by side', p: '<b>Major</b>: 1 2 3 4 5 6 7<br><b>Natural minor</b>: 1 2 b3 4 5 b6 b7<br><b>Major pentatonic</b>: 1 2 3 5 6<br><b>Minor pentatonic</b>: 1 b3 4 5 b7<br><b>Blues</b>: 1 b3 4 b5 5 b7<br>Same root, different notes kept = different mood.' },
    { h: 'Which one when?', p: 'Rock, blues, sad or gritty → <b>minor pentatonic</b> or <b>blues</b>. Happy, pop, country → <b>major pentatonic</b>. Want every colour for melodies → full <b>major</b> or <b>minor</b>. Good habit: start with the pentatonic (safe), then add the extra notes for colour.' },
    { h: 'Scale vs chord vs arpeggio', p: '<b>Scale</b> = the notes available, played one after another. <b>Chord</b> = a few of those notes played <b>together</b>. <b>Arpeggio</b> = a chord’s notes played <b>one at a time</b>. All three come from the same palette.' },
  ],
  quiz: [
    { t: 'mc', id: 'q5-5a', q: 'How many notes in a pentatonic scale?', o: ['4', '5', '6', '7'], a: 1, ex: 'Penta = five.' },
    { t: 'mc', id: 'q5-5b', q: 'The blues scale is…', o: ['Major scale + b7', 'Minor pentatonic + b5', 'Major pentatonic + 4', 'Natural minor − 2'], a: 1, ex: 'Add the “blue note” b5.' },
    { t: 'mc', id: 'q5-5c', q: 'Safest first choice to solo over a rock song in A minor?', o: ['A major scale', 'A minor pentatonic', 'A Lydian', 'A chromatic scale'], a: 1, ex: 'Five strong notes, nothing clashes.' },
    { t: 'mc', id: 'q5-5d', q: 'What is the difference between a scale and a chord?', o: ['None', 'Scale = notes in order; chord = some of them played together', 'Chords have more notes', 'Scales are only for piano'], a: 1, ex: 'Same palette, different use.' },
    { t: 'mc', id: 'q5-5e', q: 'A natural minor scale has the same notes as…', o: ['Its relative major scale', 'The blues scale', 'Any pentatonic', 'The chromatic scale'], a: 0, ex: 'A minor = C major notes, starting on A.' },
  ],
  practice: { type: 'drill', title: 'Four scales, one root', how: 'Around fret 5, play A minor pentatonic, then A blues (add Eb), then A natural minor (add B and F). Same root, hear how the mood changes. Use the scale menu in the Studio to see each one.', bpm: 70, fb: { from: 4, to: 9, marks: () => scaleMarks('A', 'minor', 5, 8) } },
  jam: { prompt: '8 bars with minor pentatonic, 8 bars with the blues scale, 8 bars with natural minor. Switch the scale menu as you go and notice the difference.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
};

// insert the new chapters at the right places
(function placeChapters() {
  // Order is built so every lesson only uses what came before it.
  const take = (ch, id) => { const i = ch.lessons.findIndex(l => l.id === id); return ch.lessons.splice(i, 1)[0]; };
  const chordNames = take(CH_SHORTHAND, 'r-2');   // needs intervals + chord building + sus/dim → end of More Chords
  const sharpsFlats = take(CH_SHORTHAND, 'r-4');  // needs the major scale → opens the Keys chapter
  CH_SHORTHAND.title = 'Reading Diagrams & Tabs';
  CH_SHORTHAND.blurb = 'Read any chord diagram or tab a guitarist writes.';
  CH_KEYS.lessons.unshift(sharpsFlats);
  chordNames.title = 'Chord names decoded (cheat sheet)';
  CH_MORECHORDS.lessons.push(chordNames);
  const at = id => CHAPTERS.findIndex(c => c.id === id);
  CHAPTERS.splice(at('c1') + 1, 0, CH_SHORTHAND, CH_RHYTHM);          // Fretboard → Diagrams & Tabs → Rhythm
  const pent = CHAPTERS.splice(at('c5'), 1)[0];
  CHAPTERS.splice(at('c4') + 1, 0, pent, CH_KEYS, CH_MORECHORDS);     // Chords → Pentatonic → Keys → More Chords
  CHAPTERS[at('c3')].lessons.unshift(LESSON_WHAT_IS_SCALE);
  CHAPTERS[at('c5')].lessons.push(LESSON_SCALE_FAMILY);
  const c6 = CHAPTERS[at('c6')];
  c6.title = 'Target Notes & Arpeggios';
  c6.lessons.push(...EXTRA_TARGET_LESSONS);
  CHAPTERS.push(CH_MODES, CH_PHRASING);
})();

const ALL_LESSONS = CHAPTERS.flatMap(c => c.lessons.map(l => ({ ...l, chapter: c })));
const LESSON_BY_ID = Object.fromEntries(ALL_LESSONS.map(l => [l.id, l]));
const QUESTION_BY_ID = {};
ALL_LESSONS.forEach(l => l.quiz.forEach(q => { QUESTION_BY_ID[q.id] = { ...q, lesson: l.id }; }));
