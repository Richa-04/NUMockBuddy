'use client'

import { useState } from 'react'
import Link from 'next/link'

const COMPANIES_DATA = [
  {
    name: 'Google',
    color: '#4285F4',
    bg: '#EBF2FF',
    initials: 'G',
    role: 'SWE / SDE',
    questions: [
      { title: 'Two Sum', difficulty: 'Easy', tag: 'Array', leetcode: 'https://leetcode.com/problems/two-sum/' },
      { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tag: 'Sliding Window', leetcode: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', tag: 'Binary Search', leetcode: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
      { title: 'Word Ladder', difficulty: 'Hard', tag: 'BFS', leetcode: 'https://leetcode.com/problems/word-ladder/' },
      { title: 'Meeting Rooms II', difficulty: 'Medium', tag: 'Heap', leetcode: 'https://leetcode.com/problems/meeting-rooms-ii/' },
      { title: 'Number of Islands', difficulty: 'Medium', tag: 'DFS/BFS', leetcode: 'https://leetcode.com/problems/number-of-islands/' },
    ],
  },
  {
    name: 'Amazon',
    color: '#FF9900',
    bg: '#FFF4E0',
    initials: 'A',
    role: 'SDE / Co-op',
    questions: [
      { title: 'LRU Cache', difficulty: 'Medium', tag: 'Design', leetcode: 'https://leetcode.com/problems/lru-cache/' },
      { title: 'Trapping Rain Water', difficulty: 'Hard', tag: 'Two Pointers', leetcode: 'https://leetcode.com/problems/trapping-rain-water/' },
      { title: 'Top K Frequent Elements', difficulty: 'Medium', tag: 'Heap', leetcode: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { title: 'Course Schedule', difficulty: 'Medium', tag: 'Graph', leetcode: 'https://leetcode.com/problems/course-schedule/' },
      { title: 'Merge K Sorted Lists', difficulty: 'Hard', tag: 'Linked List', leetcode: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { title: 'Rotting Oranges', difficulty: 'Medium', tag: 'BFS', leetcode: 'https://leetcode.com/problems/rotting-oranges/' },
    ],
  },
  {
    name: 'Meta',
    color: '#1877F2',
    bg: '#E8F0FE',
    initials: 'M',
    role: 'SWE / Intern',
    questions: [
      { title: 'Valid Parentheses', difficulty: 'Easy', tag: 'Stack', leetcode: 'https://leetcode.com/problems/valid-parentheses/' },
      { title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', tag: 'BFS', leetcode: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', tag: 'Tree', leetcode: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
      { title: 'Subarray Sum Equals K', difficulty: 'Medium', tag: 'HashMap', leetcode: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
      { title: 'Minimum Window Substring', difficulty: 'Hard', tag: 'Sliding Window', leetcode: 'https://leetcode.com/problems/minimum-window-substring/' },
      { title: 'Clone Graph', difficulty: 'Medium', tag: 'Graph', leetcode: 'https://leetcode.com/problems/clone-graph/' },
    ],
  },
  {
    name: 'Microsoft',
    color: '#00A4EF',
    bg: '#E3F6FD',
    initials: 'MS',
    role: 'SWE / Explorer',
    questions: [
      { title: 'Reverse Linked List', difficulty: 'Easy', tag: 'Linked List', leetcode: 'https://leetcode.com/problems/reverse-linked-list/' },
      { title: 'Lowest Common Ancestor', difficulty: 'Medium', tag: 'Tree', leetcode: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
      { title: 'Design Add and Search Words', difficulty: 'Medium', tag: 'Trie', leetcode: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/' },
      { title: 'Jump Game II', difficulty: 'Medium', tag: 'Greedy', leetcode: 'https://leetcode.com/problems/jump-game-ii/' },
      { title: 'Alien Dictionary', difficulty: 'Hard', tag: 'Topological Sort', leetcode: 'https://leetcode.com/problems/alien-dictionary/' },
      { title: 'Find Median from Data Stream', difficulty: 'Hard', tag: 'Heap', leetcode: 'https://leetcode.com/problems/find-median-from-data-stream/' },
    ],
  },
  {
    name: 'Apple',
    color: '#555555',
    bg: '#F2F2F2',
    initials: 'AP',
    role: 'SWE / Intern',
    questions: [
      { title: 'Merge Intervals', difficulty: 'Medium', tag: 'Array', leetcode: 'https://leetcode.com/problems/merge-intervals/' },
      { title: 'Kth Largest Element in Array', difficulty: 'Medium', tag: 'Heap', leetcode: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', tag: 'DFS', leetcode: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
      { title: 'Word Search II', difficulty: 'Hard', tag: 'Trie', leetcode: 'https://leetcode.com/problems/word-search-ii/' },
      { title: 'Regular Expression Matching', difficulty: 'Hard', tag: 'DP', leetcode: 'https://leetcode.com/problems/regular-expression-matching/' },
      { title: '3Sum', difficulty: 'Medium', tag: 'Two Pointers', leetcode: 'https://leetcode.com/problems/3sum/' },
    ],
  },
  {
    name: 'Salesforce',
    color: '#00A1E0',
    bg: '#E0F5FD',
    initials: 'SF',
    role: 'SWE / Intern',
    questions: [
      { title: 'Design HashMap', difficulty: 'Easy', tag: 'Design', leetcode: 'https://leetcode.com/problems/design-hashmap/' },
      { title: 'Flatten Nested List Iterator', difficulty: 'Medium', tag: 'Stack', leetcode: 'https://leetcode.com/problems/flatten-nested-list-iterator/' },
      { title: 'Max Points on a Line', difficulty: 'Hard', tag: 'Math', leetcode: 'https://leetcode.com/problems/max-points-on-a-line/' },
      { title: 'Insert Delete GetRandom O(1)', difficulty: 'Medium', tag: 'Design', leetcode: 'https://leetcode.com/problems/insert-delete-getrandom-o1/' },
      { title: 'Longest Consecutive Sequence', difficulty: 'Medium', tag: 'HashSet', leetcode: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
      { title: 'Find All Anagrams in a String', difficulty: 'Medium', tag: 'Sliding Window', leetcode: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/' },
    ],
  },
  {
    name: 'Fidelity',
    color: '#006B3F',
    bg: '#E0F4EC',
    initials: 'FI',
    role: 'Tech / Co-op',
    questions: [
      { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', tag: 'Array', leetcode: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { title: 'Best Time to Buy and Sell Stock III', difficulty: 'Hard', tag: 'DP', leetcode: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/' },
      { title: 'Maximum Subarray', difficulty: 'Medium', tag: 'DP', leetcode: 'https://leetcode.com/problems/maximum-subarray/' },
      { title: 'Coin Change', difficulty: 'Medium', tag: 'DP', leetcode: 'https://leetcode.com/problems/coin-change/' },
      { title: 'Decode Ways', difficulty: 'Medium', tag: 'DP', leetcode: 'https://leetcode.com/problems/decode-ways/' },
      { title: 'Unique Paths', difficulty: 'Medium', tag: 'DP', leetcode: 'https://leetcode.com/problems/unique-paths/' },
    ],
  },
  {
    name: 'Adobe',
    color: '#FF0000',
    bg: '#FFE8E8',
    initials: 'AD',
    role: 'SWE / Intern',
    questions: [
      { title: 'Spiral Matrix', difficulty: 'Medium', tag: 'Matrix', leetcode: 'https://leetcode.com/problems/spiral-matrix/' },
      { title: 'Game of Life', difficulty: 'Medium', tag: 'Matrix', leetcode: 'https://leetcode.com/problems/game-of-life/' },
      { title: 'Rectangle Area', difficulty: 'Medium', tag: 'Math', leetcode: 'https://leetcode.com/problems/rectangle-area/' },
      { title: 'Max Rectangle', difficulty: 'Hard', tag: 'Stack', leetcode: 'https://leetcode.com/problems/maximal-rectangle/' },
      { title: 'Search a 2D Matrix II', difficulty: 'Medium', tag: 'Binary Search', leetcode: 'https://leetcode.com/problems/search-a-2d-matrix-ii/' },
      { title: 'Set Matrix Zeroes', difficulty: 'Medium', tag: 'Matrix', leetcode: 'https://leetcode.com/problems/set-matrix-zeroes/' },
    ],
  },
]

const DIFF_COLOR: Record<string, { bg: string; text: string }> = {
  Easy:   { bg: '#E6F4EA', text: '#1E7E34' },
  Medium: { bg: '#FFF3CD', text: '#856404' },
  Hard:   { bg: '#FDECEA', text: '#B71C1C' },
}

export default function CompaniesPage() {
  const [selected, setSelected] = useState(COMPANIES_DATA[0])

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#888', fontSize: 13 }}>← Home</Link>
        <span style={{ color: '#DDD' }}>|</span>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: 0, fontFamily: 'var(--font-display)' }}>
          Company Interview Questions
        </h1>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#AAA', background: '#F3F3F3', padding: '3px 10px', borderRadius: 999 }}>
          {COMPANIES_DATA.length} companies
        </span>
      </div>

      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '32px 24px', gap: 28 }}>

        {/* Sidebar — company list */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Companies
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {COMPANIES_DATA.map(company => (
              <button
                key={company.name}
                onClick={() => setSelected(company)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: selected.name === company.name ? company.bg : 'transparent',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  outline: selected.name === company.name ? `1.5px solid ${company.color}22` : 'none',
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: company.bg,
                  border: `1.5px solid ${company.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: company.color,
                  flexShrink: 0,
                }}>
                  {company.initials}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: selected.name === company.name ? 600 : 400, color: '#111' }}>
                    {company.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#AAA' }}>{company.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main — questions list */}
        <div style={{ flex: 1 }}>
          {/* Company header */}
          <div style={{
            background: '#fff',
            border: '1px solid #EBEBEB',
            borderRadius: 14,
            padding: '20px 24px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: selected.bg,
              border: `2px solid ${selected.color}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: selected.color,
            }}>
              {selected.initials}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0, fontFamily: 'var(--font-display)' }}>
                {selected.name}
              </h2>
              <p style={{ fontSize: 13, color: '#888', margin: '2px 0 0' }}>
                {selected.questions.length} frequently asked questions · {selected.role}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {['Easy', 'Medium', 'Hard'].map(d => {
                const count = selected.questions.filter(q => q.difficulty === d).length
                return count > 0 ? (
                  <span key={d} style={{
                    fontSize: 12,
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: DIFF_COLOR[d].bg,
                    color: DIFF_COLOR[d].text,
                    fontWeight: 500,
                  }}>
                    {count} {d}
                  </span>
                ) : null
              })}
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selected.questions.map((q, i) => (
              <div
                key={q.title}
                style={{
                  background: '#fff',
                  border: '1px solid #EBEBEB',
                  borderRadius: 12,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Number */}
                <span style={{ fontSize: 13, color: '#CCC', fontWeight: 600, width: 24, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Title */}
                <span style={{ fontSize: 14, fontWeight: 500, color: '#111', flex: 1 }}>
                  {q.title}
                </span>

                {/* Tag */}
                <span style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#F3F3F3',
                  color: '#666',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}>
                  {q.tag}
                </span>

                {/* Difficulty */}
                <span style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: DIFF_COLOR[q.difficulty].bg,
                  color: DIFF_COLOR[q.difficulty].text,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  minWidth: 56,
                  textAlign: 'center',
                }}>
                  {q.difficulty}
                </span>

                {/* LeetCode link */}
                <a
                  href={q.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#F89F1B',
                    textDecoration: 'none',
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: '1px solid #FDE8BB',
                    background: '#FFFBF2',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEF3D7')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FFFBF2')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
                  </svg>
                  LeetCode
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}