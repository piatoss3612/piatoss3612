package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"github.com/mmcdole/gofeed"
)

const MAX_COUNT = 5

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	fp := gofeed.NewParser()
	feed, err := fp.ParseURLWithContext("https://piatoss3612.tistory.com/rss", ctx)
	if err != nil {
		log.Fatal(err)
	}

	items := feed.Items

	builder := strings.Builder{}

	builder.WriteString("## ☕ My recent posts\n\n")

	for i, item := range items {
		content := fmt.Sprintf("%d. [%s](%s) %s", i+1, item.Title, item.Link, item.PublishedParsed.Format("2006-01-02"))
		builder.WriteString(content)

		if i == MAX_COUNT-1 {
			break
		}

		builder.WriteString("\n")
	}

	f, err := os.Open("README.backup.md")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	f2, err := os.Create("README.md")
	if err != nil {
		log.Fatal(err)
	}
	defer f2.Close()

	b, err := io.ReadAll(f)
	if err != nil {
		log.Fatal(err)
	}

	s := strings.Replace(string(b), "{{RECENT_POSTS}}", builder.String(), 1)

	_, err = f2.WriteString(s)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("README.md updated")
}
