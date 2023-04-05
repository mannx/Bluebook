package api2

import (
	"testing"
)

func TestSplitTags(t *testing.T) {
	s := "#tag1 tag2 tag3#tag4"
	tags := splitTags(s)

	t.Logf("tags[0] = %v", tags[0])
	t.Logf("tags[1] = %v", tags[1])
	t.Logf("tags[2] = %v", tags[2])
	t.Logf("tags[3] = %v", tags[3])
	if tags[0] != "tag1" {
		t.Errorf("bad parse for tag1: %v", tags[0])
	}
	if tags[1] != "tag2" {
		t.Errorf("bad parse for tag1: %v", tags[0])
	}
	if tags[2] != "tag3" {
		t.Errorf("bad parse for tag1: %v", tags[0])
	}
	if tags[3] != "tag4" {
		t.Errorf("bad parse for tag1: %v", tags[0])
	}
}
