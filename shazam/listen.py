import src.analyzer as analyzer

from itertools import zip_longest
from src.listener import Listener
from src.db import SQLiteDatabase

if __name__ == '__main__':
  db = SQLiteDatabase()

  seconds = 10

  chunksize = 2**12
  channels = 1

  record_forever = False

  listener = Listener()

  listener.start_recording(seconds=seconds,
    chunksize=chunksize,
    channels=channels)

  while True:
    bufferSize = int(listener.rate / listener.chunksize * seconds)

    for i in range(0, bufferSize):
      nums = listener.process_recording()

    if not record_forever: break

  listener.stop_recording()

  def grouper(iterable, n, fillvalue=None):
    args = [iter(iterable)] * n
    return (filter(None, values) for values
            in zip_longest(fillvalue=fillvalue, *args))

  data = listener.get_recorded_data()

  msg = 'Took %d samples'

  Fs = analyzer.DEFAULT_FS
  channel_amount = len(data)

  result = set()
  matches = []

  def find_matches(samples, Fs=analyzer.DEFAULT_FS):
    hashes = analyzer.fingerprint(samples, Fs=Fs)
    return return_matches(hashes)

  def return_matches(hashes):
    mapper = {}
    for hash, offset in hashes:
      mapper[hash.upper()] = offset
    values = mapper.keys()

    for split_values in grouper(values, 1000):
      query = """
        SELECT upper(hash), song_fk, offset
        FROM fingerprints
        WHERE upper(hash) IN (%s)
      """
      vals = list(split_values).copy()
      length = len(vals)
      query = query % ', '.join('?' * length)
      x = db.executeAll(query, values=vals)

      for hash, sid, offset in x:
        yield (sid, mapper[hash])

  for channeln, channel in enumerate(data):
    matches.extend(find_matches(channel))

  def align_matches(matches):
    diff_counter = {}
    largest = 0
    largest_count = 0
    song_id = -1

    for tup in matches:
      sid, diff = tup

      if diff not in diff_counter:
        diff_counter[diff] = {}

      if sid not in diff_counter[diff]:
        diff_counter[diff][sid] = 0

      diff_counter[diff][sid] += 1

      if diff_counter[diff][sid] > largest_count:
        largest = diff
        largest_count = diff_counter[diff][sid]
        song_id = sid
    

    songM = db.get_song_by_id(song_id)

    nseconds = round(float(largest) / analyzer.DEFAULT_FS *
                     analyzer.DEFAULT_WINDOW_SIZE *
                     analyzer.DEFAULT_OVERLAP_RATIO, 5)

    return {
        "SONG_ID" : song_id,
        "SONG_NAME" : songM[1],
        "CONFIDENCE" : largest_count,
        "OFFSET" : int(largest),
        "OFFSET_SECS" : nseconds
    }

  total_matches_found = len(matches)

  if total_matches_found > 0:

    song = align_matches(matches)
    
    songName, artist = (song['SONG_NAME'].split('.')[0]).split('-')

    print('Song name:', songName)
    print('Artist:', artist)
  else:
    print('No song matching')
