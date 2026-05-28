import { Link } from 'react-router-dom'
import { pageLinks } from '../utils/pages'

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-linear-to-br from-[#f5f3e8] to-[#ece8d9] px-6 py-8 font-momoSans text-[#29261f]">
      <section className="w-full max-w-3xl border border-[#ded9cc] bg-[#fbfaf3] p-5 shadow-[0_12px_30px_rgba(49,44,35,0.08)] md:p-8">
        <p className="mb-3 text-sm tracking-[0.2em] text-[#7d7768] uppercase">Pages</p>
        <h1 className="font-momo text-4xl leading-tight font-bold text-[#201f1b] md:text-5xl">页面导航</h1>
        <p className="mt-4 mb-6 text-base leading-relaxed text-[#4a463f] md:text-xl">点击进入对应页面。</p>
        <ul className="grid gap-3" aria-label="页面列表">
          {pageLinks.map((page) => (
            <li key={page.path}>
              <Link
                to={page.path}
                className="block border border-[#d9d3c3] bg-[#f6f2e6] px-4 py-4 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(45,39,29,0.1)]"
              >
                <span className="block font-momo text-2xl leading-tight font-semibold">{page.title}</span>
                <small className="mt-2 block text-sm text-[#5a554a] md:text-base">{page.description}</small>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
