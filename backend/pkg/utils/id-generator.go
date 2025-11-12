package utils

import (
	"sync"
	"time"
)

const (
	workerBits     = 5
	datacenterBits = 5
	sequenceBits   = 12
	timestampBits  = 31

	maxWorkerID     = -1 ^ (-1 << workerBits)
	maxDatacenterID = -1 ^ (-1 << datacenterBits)
	maxSequence     = -1 ^ (-1 << sequenceBits)

	workerShift     = sequenceBits
	datacenterShift = sequenceBits + workerBits
	timestampShift  = sequenceBits + workerBits + datacenterBits

	epoch = int64(1700000000000) // adjust as needed
)

var (
	mu            sync.Mutex
	lastTimestamp int64
	sequence      int64
	workerID      int64 = 1
	datacenterID  int64 = 1
)

//todo: should return int64

func GenerateID() int64 {
	mu.Lock()
	defer mu.Unlock()

	now := time.Now().UnixMilli()

	if now == lastTimestamp {
		sequence = (sequence + 1) & maxSequence
		if sequence == 0 {
			for now <= lastTimestamp {
				now = time.Now().UnixMilli()
			}
		}
	} else {
		sequence = 0
	}

	lastTimestamp = now

	ts := (now - epoch) & ((1 << timestampBits) - 1)

	id := (ts << timestampShift) | (datacenterID << datacenterShift) | (workerID << workerShift) | sequence

	return id
}
