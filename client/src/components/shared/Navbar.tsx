import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import styles from './Navbar.module.css'
interface NavLink {
    to: string,
    label: string
}

const links: NavLink[] = [
    {to: "/", label: "Dashboard"},
    {to: "/planner", label: "Planner"},
    {to: "/history", label: "History"},
    {to: "/progress", label: "Progress"},
    {to: "/templates", label: "Templates"}
]
 
export default function NavBar(){
    const { signOut } = useAuth()
    const { pathname } = useLocation()
    return (
    <nav className={styles.nav}>
        <span className={styles.logo}>My Workout Logger</span>
        <div className={styles.links}>
            {links.map((link) => (
                <Link
                    key={link.to}
                    to={link.to}
                    className={`${styles.link} ${pathname === link.to ? styles.linkActive : ''}`}
                >
                    {link.label}
                </Link>
            ))}
        </div>
        <button className={styles.signOut} onClick={signOut}>Sign Out</button>
    </nav>);
}