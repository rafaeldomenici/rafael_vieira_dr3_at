import { Modal as Md } from 'react-native';

const Modal = (props: any) => {
    return  <Md {...props}>
                {props.children}
            </Md>
}

export default Modal;