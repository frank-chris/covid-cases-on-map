import sys
import os

low = sys.argv[1]
high = sys.argv[2]
start_date = '03/23/2020'

if len(sys.argv) == 4:
    start_date = sys.argv[3]

os.system('python pyscript.py '+low+' '+ start_date +' low')
os.system('python pyscript.py '+high+' '+ start_date +' high')
