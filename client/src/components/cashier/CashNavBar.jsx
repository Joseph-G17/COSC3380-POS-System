import NavBar from '../admin/NavBar'

//The cashier POS uses the same nav bar as admin (search, notifications, clock-in, log out).
//NavBar switches its POS/clock-in buttons when it is on a /cashier page.
const CashNavBar = (props) => <NavBar {...props} />

export default CashNavBar
