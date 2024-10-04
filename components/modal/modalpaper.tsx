import * as React from 'react';
import { Modal, Portal, Text, Button, PaperProvider } from 'react-native-paper';

export default function ModalPaper(props: any) {
  

  
  const containerStyle = {backgroundColor: 'white', padding: 20};

  return (
    <PaperProvider>
      <Portal>
        <Modal visible={props.visible} contentContainerStyle={containerStyle}>
          {props.children}
        </Modal>
      </Portal>
     
    </PaperProvider>
  );
};

