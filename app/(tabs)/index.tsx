import { StyleSheet } from 'react-native';
import Fab from '@/components/fab/fab';
import { useState, useEffect } from 'react';
import { Appbar } from 'react-native-paper'
import { router , Link} from 'expo-router'
import Topbar from '@/components/navigation/topbar'
import { View } from 'react-native'
import { excluirItem, excluirUsuario, listarItens, listarUsuarios } from '@/services/itensLista';
import Card from '@/components/card/card';
import { ScrollView } from 'react-native';
import  Text  from '@/components/text/text'
import  Dialog from '@/components/dialog/dialog'
import {useSession} from '@/app/ctx'
import { drop, select } from '@/services/database';
import { ItemIterface } from '@/interfaces/Item';
import Grid from '@/components/grid/grid'
import Checkbox from 'react-native'
import IconButton from '@/components/iconbutton/iconbutton'
import List from '@/components/list/list'
export default function HomeScreen() {

  const [data2, setData2] = useState([])
  const [data, setData] = useState([]);
  const [controle, setControle] = useState(false);
  const [itemToDelete,setItemToDelete] = useState(null);
  const [dialogVisible,setDialogVisible] = useState(false);
  const {session} = useSession()
  
  let estilo = {
    backgroundColor: "lightblue",
    width: "50%"
  }
  
  const loadData = async () => {
    const d: Array<ItemIterface> = await select("item", [ "uid", "title", "description", "createdAt", "sync"], "", true);
    setData(d);
    
}
const loadData2 = async () => {
  const ingredientes = await select("item_ingrediente", [ "uid", "ingrediente", "itemUid", "createdAt", "sync"], "", true);
  setData2(ingredientes);
}

useEffect(() => {
  loadData();
  loadData2();
  console.log(data2);
  
}, []);

useEffect(() => {
    loadData2();
    loadData();
    
}, [controle]);


  

return <Grid style={{
  height: '100%',
  width: '100%',
}}>
  <Grid>
      <Topbar title="Home"/>
      
  </Grid>
  
  <Grid>
      {
          data.length > 0 ?
              data.map((d: ItemIterface, idx: number) => {
                let botoes = [{label: "excluir", onPress: () => {
                  setItemToDelete(d.uid);
                  setDialogVisible(true);
                  
                }},{label: "editar", onPress: () => {
                  router.navigate({ pathname: `form`, params: { uid: d.uid } });
                }},{label: "visualizar", onPress: () => {
                  router.navigate({ pathname: `receitas`, params: { uid: d.uid } });
                }}]
                  return <Grid style={{backgroundColor: "lightblue", marginBottom: "10px", position: "relative", padding: "10px"}}><Card style={{padding: "10px"}} title={d.title}  buttons={botoes}/></Grid>
              })
              : null
      }
  </Grid>
  <Fab
      icon="plus"
      onPress={() => {
          router.push('form');
      }}
      style={{
          bottom: 20,
          position: 'absolute',
          borderRadius: 200,
          right: 20,
      }}/>
      <Dialog
            icon={"alert"}
            title={"Excluir item"}
            text={"Deseja realmente excluir este item?"}
            visible={dialogVisible}
            setVisibility={setDialogVisible}
            onDismiss={() => setDialogVisible(false)}
            actions={[
                {
                    text: "Cancelar",
                    onPress: () => {
                        setDialogVisible(false);
                        setItemToDelete(null);
                        
                    }
                },
                {
                    text: "Excluir",
                    onPress: async () => {
                        console.log(itemToDelete);
                        await drop("item",`uid='${itemToDelete}'`)
                        setControle(!controle);
                        setItemToDelete(null);   
                        setDialogVisible(false);
                    }
                }
            ]}
        />
</Grid>;


   
  
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
    
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
