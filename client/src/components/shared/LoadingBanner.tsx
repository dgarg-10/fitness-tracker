import { useLoading } from '../../context/LoadingContext'
import styles from './LoadingBanner.module.css'

export default function LoadingBanner() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className={styles.banner} role="status">
      Loading data, please wait...
    </div>
  )
}
