import { Link } from 'react-router-dom'
import { pageLinks } from '@/utils/pages'
import styles from './index.module.css'

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Pages</p>
        <h1 className={styles.title}>页面导航</h1>
        <p className={styles.description}>点击进入对应页面。</p>
        <ul className={styles.list} aria-label="页面列表">
          {pageLinks.map((page) => (
            <li key={page.path}>
              <Link to={page.path} className={styles.link}>
                <span className={styles.linkTitle}>{page.title}</span>
                <small className={styles.linkDescription}>{page.description}</small>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
