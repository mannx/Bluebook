package daily

import (
	"testing"
)

func Test_getCell(t *testing.T) {
	// test with value of B2
	want := "C2"
	got := getCell(2, 2)

	if want != got {
		// fail
		t.Fatalf("Wanted: B2.  Got %v", got)
	}
}
