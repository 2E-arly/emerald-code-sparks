import Logo from "../../assets/casmm_logo.png";
import NavBar from "../../components/NavBar/NavBar";
import './Home.less';
import {StudentJoinClassroomForm} from "./StudentJoinClassroomForm";

const Home = () => (
    <div className='container nav-padding'>
        <NavBar />
        <div id='join-wrapper'>
            <img src={Logo} id='casmm-logo' alt='logo'/>
            <StudentJoinClassroomForm />
        </div>
    </div>
)

export default Home;