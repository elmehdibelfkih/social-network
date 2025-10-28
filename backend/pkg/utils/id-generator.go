package utils

import (
	"sort"
	"sync"
	"time"
)

const (
	workerBits     = 5
	datacenterBits = 5
	sequenceBits   = 12

	maxWorkerID     = -1 ^ (-1 << workerBits)
	maxDatacenterID = -1 ^ (-1 << datacenterBits)
	maxSequence     = -1 ^ (-1 << sequenceBits)

	workerShift     = sequenceBits
	datacenterShift = sequenceBits + workerBits
	timestampShift  = sequenceBits + workerBits + datacenterBits

	epoch = int64(1700000000000)
)

var (
	mu            sync.Mutex
	lastTimestamp int64
	sequence      uint64
	workerID      uint64 = 1
	datacenterID  uint64 = 1
)

func GenerateID() uint64 {
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

	id := (uint64(now-epoch) << timestampShift) |
		(datacenterID << datacenterShift) |
		(workerID << workerShift) |
		sequence

	return id
}

func SortIDs(ids []uint64) []uint64 {
	sorted := make([]uint64, len(ids))
	copy(sorted, ids)

	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i] < sorted[j]
	})

	return sorted
}
