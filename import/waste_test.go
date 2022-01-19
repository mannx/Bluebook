package daily

import (
	"testing"
)

func Test_getCell(t *testing.T) {
	// test with value of B2
	want := "B2"
	got := getCell(2, 1)

	if want != got {
		// fail
		t.Fatalf("Wanted: B2.  Got %v", got)
	}
}
