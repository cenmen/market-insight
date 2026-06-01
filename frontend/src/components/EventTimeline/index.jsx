import styles from './index.module.css';

export default function EventTimeline(props) {
  const { items } = props;

  return (
    <div className={styles.eventList}>
      {items.map(function mapEvent(item) {
        return (
          <article className={styles.event} key={`${item.title}-${item.date}`}>
            <div className={styles.eventDot} />
            <div className={styles.eventBody}>
              <div className={styles.eventHead}>
                <div className={styles.eventTitle}>{item.title}</div>
                <div className={styles.eventDate}>{item.date}</div>
              </div>
              <div className={styles.eventMeta}>{item.source}</div>
              <p className={styles.eventSummary}>{item.summary}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
