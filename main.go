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

const MAX_COUNT = 5 // 최근 포스트의 최대 개수

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	fp := gofeed.NewParser()                                                        // RSS Feed를 파싱하는 객체 생성
	feed, err := fp.ParseURLWithContext("https://piatoss3612.tistory.com/rss", ctx) // RSS Feed를 파싱
	if err != nil {
		log.Fatal(err)
	}

	items := feed.Items // Feed의 Item들을 가져옴

	builder := strings.Builder{} // 문자열을 빌드하기 위한 객체 생성

	builder.WriteString("## ☕ My recent posts\n\n") // 소제목 추가

	// Feed의 Item들을 순회하며 문자열을 빌드
	for i, item := range items {
		content := fmt.Sprintf("%d. [%s](%s) %s",
			i+1, item.Title, item.Link, item.PublishedParsed.Format("2006-01-02"), // item 번호, item 제목, item 링크, item 작성일
		)
		builder.WriteString(content)

		// MAX_COUNT만큼만 빌드 후 종료
		if i == MAX_COUNT-1 {
			break
		}

		builder.WriteString("\n") // 줄바꿈
	}

	f, err := os.Open("README.backup.md") // README.backup.md 파일을 읽기 전용으로 열기
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	f2, err := os.Create("README.md") // README.md 파일을 생성
	if err != nil {
		log.Fatal(err)
	}
	defer f2.Close()

	b, err := io.ReadAll(f) // README.backup.md 파일의 내용을 읽어옴
	if err != nil {
		log.Fatal(err)
	}

	s := strings.Replace(string(b), "{{RECENT_POSTS}}", builder.String(), 1) // README.backup.md 파일의 내용 중 {{RECENT_POSTS}}를 빌드한 문자열로 치환

	_, err = f2.WriteString(s) // README.md 파일에 문자열 쓰기
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("README.md updated")
}
