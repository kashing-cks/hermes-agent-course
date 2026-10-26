"""Dependency-free checks for the learning hub's integration contract."""
from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.elements = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

class ShellTest(unittest.TestCase):
    def test_semantic_shell_and_integration_contract(self):
        path = ROOT / 'index.html'
        self.assertTrue(path.exists(), 'Learning shell index.html is missing')
        text = path.read_text()
        doc = Document(text)
        ids = [a['id'] for _, a in doc.elements if 'id' in a]
        self.assertEqual(len(ids), len(set(ids)), 'IDs must be unique')
        required = 'sidebar menu-toggle theme-toggle search topic-filter chapter-count chapter-list progress-label progress-bar reset-progress chapter-title chapter-meta chapter-summary chapter-content complete-btn prev-btn next-btn video-frame load-video video-link video-status timestamp-input timestamp-jump notes notes-status architecture-nodes architecture-detail template-list offer-form offer-tier clients setup retainer monthly-cost delivery-hours hourly-cost saved-hours client-hourly-value calculator-results quiz-list quiz-grade quiz-reset quiz-result toast'.split()
        for name in required:
            self.assertIn(name, ids)
        by_id = {a['id']: (tag, a) for tag, a in doc.elements if 'id' in a}
        for view in ('course', 'architecture', 'templates', 'calculator', 'quiz'):
            tag, attrs = by_id['view-' + view]
            self.assertEqual((tag, attrs.get('role')), ('section', 'tabpanel'))
            tabs = [a for tag, a in doc.elements if tag == 'button' and a.get('data-view') == view]
            self.assertEqual(len(tabs), 1)
            self.assertEqual(tabs[0]['role'], 'tab')
            self.assertEqual(tabs[0]['aria-controls'], 'view-' + view)
        self.assertEqual(by_id['menu-toggle'][1]['aria-expanded'], 'false')
        self.assertEqual(by_id['search'][1]['type'], 'search')
        self.assertEqual(by_id['video-frame'][1]['src'], 'about:blank')
        self.assertEqual(by_id['video-frame'][1]['title'], 'YouTube course')
        self.assertEqual(by_id['progress-bar'][0], 'progress')
        for name in ('calculator-results', 'quiz-result'):
            self.assertEqual(by_id[name][1]['aria-live'], 'polite')
        for name, value in {'clients':'3', 'setup':'2000', 'retainer':'500', 'monthly-cost':'100', 'delivery-hours':'10', 'hourly-cost':'40', 'saved-hours':'20', 'client-hourly-value':'50'}.items():
            attrs = by_id[name][1]
            self.assertEqual((attrs['type'], attrs['value'], attrs['min']), ('number', value, '0'))
        self.assertEqual(by_id['clients'][1]['max'], '100')
        self.assertTrue(any(tag == 'main' for tag, _ in doc.elements))
        self.assertTrue(any(tag == 'noscript' for tag, _ in doc.elements))
        self.assertEqual([a['src'] for tag, a in doc.elements if tag == 'script'], ['assets/content.js', 'assets/core.js', 'assets/app.js'])
        for tag, attrs in doc.elements:
            self.assertFalse(any(k.startswith('on') for k in attrs), 'No inline handlers')
            if tag == 'script':
                self.assertIn('defer', attrs)
            if tag == 'a' and attrs.get('target') == '_blank':
                self.assertIn('noopener', attrs.get('rel', ''))
        csp = next(a['content'] for tag, a in doc.elements if tag == 'meta' and a.get('http-equiv') == 'Content-Security-Policy')
        self.assertIn("script-src 'self'", csp)
        self.assertIn("style-src 'self'", csp)
        self.assertIn('frame-src https://www.youtube-nocookie.com', csp)
        self.assertNotIn('unsafe-inline', csp)
        self.assertIn('lang="zh-Hant"', text)

    def test_accessible_responsive_style_and_local_icon(self):
        css_path = ROOT / 'assets/style.css'
        self.assertTrue(css_path.exists(), 'Responsive stylesheet is missing')
        css = css_path.read_text()
        for hook in ('chapter-item', 'active', 'done', 'tag', 'lesson-grid', 'lesson-block', 'steps', 'arch-node', 'template-card', 'quiz-card', 'quiz-option', 'correct', 'incorrect', 'result-grid', 'metric', 'empty'):
            self.assertIn('.' + hook, css)
        for feature in (':focus-visible', 'prefers-reduced-motion', '[hidden]', '@media', '280px', '44px'):
            self.assertIn(feature, css)
        self.assertNotIn('@import', css)
        self.assertNotIn('https://', css)
        svg_path = ROOT / 'assets/favicon.svg'
        self.assertTrue(svg_path.exists(), 'Local SVG favicon is missing')
        from xml.etree import ElementTree
        self.assertEqual(ElementTree.parse(svg_path).getroot().tag, '{http://www.w3.org/2000/svg}svg')

if __name__ == '__main__':
    unittest.main(verbosity=2)
