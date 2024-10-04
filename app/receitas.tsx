import {ScrollView} from 'react-native';
import Avatar from "@/components/avatar/avatar";
import Button from "@/components/button/button";
import Grid from "@/components/grid/grid";
import TextInput from "@/components/textinput/textinput";
import {Link, useLocalSearchParams} from "expo-router";
import {useState, useEffect} from "react";
import {Text} from "react-native-paper";
import { esqueciSenha } from '@/services/auth';
import Snackbar from "@/components/snackbar/snackbar"
import { select } from '@/services/database';
import Card from '@/components/card/card';

export default function ReceitasScreen() {
    const [email, setEmail] = useState('');
    const [messageText, setMessageText] = useState(null);
    const [data, setData] = useState({ingredientes: [], etapas: []})
    const params = useLocalSearchParams();

    const loadData = async () => {
      const d = await select("item", [ "uid", "title", "description", "createdAt", "sync"], `uid='${params.uid}'`, false);
      const ingredientes = await select("item_ingrediente", [ "uid", "ingrediente", "itemUid", "createdAt", "sync"], `itemUid='${params.uid}'`, true);
      const etapas = await select("item_etapa", [ "uid", "etapa", "itemUid", "createdAt", "sync"], `itemUid='${params.uid}'`, true);
      const images: Array<ItemImageInterface> = await select("item_image", [ "uid", "image", "itemUid", "createdAt", "sync"], `itemUid='${params.uid}'`, true);
      d.ingredientes = ingredientes;
      d.etapas = etapas;
      d.images = images;
      setData(d);
    }

    useEffect(() => {
      loadData();
      console.log(data.ingredientes);
    }, [])
    return (
        <ScrollView>
            <Grid style={{
                display: 'flex',
                justifyContent: 'center',
                height: '100%'
            }}>
                
                <Grid style={{
                    ...styles.padding,
                    ...styles.container,
                    textAlign: 'center',
                    width: '100%'
                }}>
                    <Text style={{
                        fontSize: 24
                    }}>{data.title}</Text>
                </Grid>
                <Grid style={{
                    ...styles.padding
                }}>
                   
                   
                </Grid>
                <Grid style={{
                    ...styles.padding
                }}>
                   <Text variant="headlineLarge">Ingredientes</Text>
                   {data.ingredientes.map((item) => <Text>{item.ingrediente}</Text>)}
                </Grid>
                <Grid style={{
                    ...styles.padding,
                    
                    
                }}>
                    <Text variant="headlineLarge">Modo de Preparo</Text>
                    {data.etapas.map((item) => <Text>{item.etapa}</Text>)}
                </Grid>
                
            </Grid>
            <Snackbar
          visible={messageText !== null}
          onDismiss={() => setMessageText(null)}
          text={messageText} />
        </ScrollView>
    );
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    padding: {
        padding: 16,
    }
}