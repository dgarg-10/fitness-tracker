import { useLoading } from '../../context/LoadingContext'
import styles from './LoadingBanner.module.css'

export default function LoadingBanner() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className={styles.track} role="status">
      <div className={styles.bar} />
      <span className={styles.srOnly}>Loading data, please wait...</span>
    </div>
  )
}
