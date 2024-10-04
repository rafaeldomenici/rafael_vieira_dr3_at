import Button from "@/components/button/button"
import Camera from "@/components/camera/camera"
import Card from "@/components/card/card"
import Dialog from "@/components/dialog/dialog"
import Grid from "@/components/grid/grid"
import IconButton from "@/components/iconbutton/iconbutton"
import Snackbar from "@/components/snackbar/snackbar"
import Text from "@/components/text/text"
import TextInput from "@/components/textinput/textinput"
import Topbar from "@/components/navigation/topbar"

import {router, useLocalSearchParams} from "expo-router";
import {useEffect, useRef, useState} from "react";
import {ScrollView} from "react-native";
import {useTheme} from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import {drop, insert, select, update} from "@/services/database";
import {ItemImageInterface, ItemIterface} from "@/interfaces/Item";
import ModalPaper from "@/components/modal/modalpaper"
import Modal from "@/components/modal/modal"

export default function FormScreen() {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const params = useLocalSearchParams();
    const [dialogVisible, setDialogVisible] = useState(false);
    const [ingrediente, setIngrediente] = useState({quantidade: "", nome: ""})
    const [editarIngrediente, setEditarIngrediente] = useState({quantidade: "", nome: ""})
    const [indexIngrediente, setIndexIngrediente] = useState(null);
    const [indexEtapa, setIndexEtapa] = useState(null);
    const [editarEtapa, setEditarEtapa] = useState("");
    const [visible, setVisible] = useState(false);
    const [visible2, setVisible2] = useState(false);
    
    const [etapa, setEtapa] = useState("");
    const [data, setData] = useState<ItemIterface>({
        uid: null,
        title: null,
        description: null,
        images: [],
        etapas: [],
        ingredientes: []
    });

    const [cameraVisible, setCameraVisible] = useState(false);
    const [messageText, setMessageText] = useState(null);
    const [imageToDelete, setImageToDelete] = useState(null);
    const cameraRef = useRef(null);

    const onCapture = (photo: any) => {
        const images = data.images;
        images.push(photo.uri);
        updateImages(images);
    }

    useEffect(() => {
        loadData();
    }, []);

    function adicionarEtapa() {
      let novaListaEtapas = data.etapas;
      novaListaEtapas.push(etapa)
      setData((v: any) => ({...v, etapas: novaListaEtapas}));
      console.log(data);
    }

    function adicionarIngrediente() {
      let novaListaIngredientes = data.ingredientes;
      novaListaIngredientes.push(`${ingrediente.quantidade} ${ingrediente.nome}`)
      setData((v: any) => ({...v, ingredientes: novaListaIngredientes}));
    }

    const _update = async () => {
        setLoading(true);
        console.log(data);
        try{
            let uid = data.uid

            if (uid) {
                await update('item', {
                    title: data.title,
                    
                }, uid)

                await drop("item_image", `itemUid='${uid}'`)
                for(let image of data.images){
                    await insert('item_image', {
                        image: image,
                        itemUid: uid
                    })
                }
                await drop("item_ingrediente", `itemUid='${uid}'`)
                for(let ingrediente of data.ingredientes){
                    await insert('item_ingrediente', {
                        ingrediente: ingrediente,
                        itemUid: uid
                    })
                }
                await drop("item_etapa", `itemUid='${uid}'`)
                for(let etapa of data.etapas){
                    await insert('item_etapa', {
                        etapa: etapa,
                        itemUid: uid
                    })
                }
            }else {
                uid = await insert('item', {
                    title: data.title,
                    description: data.description,
                })

                if(data.images?.length > 0){
                  for(let image of data.images){
                      await insert('item_imagem', {
                          image: image,
                          itemUid: uid
                      })
                  }
              }

                if(data.ingredientes?.length > 0){
                    for(let ingrediente of data.ingredientes){
                        await insert('item_ingrediente', {
                            ingrediente: ingrediente,
                            itemUid: uid
                        })
                    }
                }
                if(data.etapas?.length > 0){
                  for(let etapa of data.etapas){
                      await insert('item_etapa', {
                          etapa: etapa,
                          itemUid: uid
                      })
                  }
              }
            }
            setMessageText(data.uid ? "Dado atualizado com sucesso!!!" : "Dado criado com sucesso!!!");
            setTimeout(() => {
                router.back();
            }, 2000);
        }catch (err){
            console.log(err)
            setMessageText(data.uid ? "Um erro ocorreu ao atualizar o dado.": "Um erro ocorreu ao criar o dado.")
        }

        setLoading(false);
      
    }

    const loadData = async () => {
        if(params.uid){
            const d: ItemIterface = await select("item", [ "uid", "title", "description", "createdAt", "sync"], `uid='${params.uid}'`, false);
            const images: Array<ItemImageInterface> = await select("item_image", [ "uid", "image", "itemUid", "createdAt", "sync"], `itemUid='${params.uid}'`, true);
            const ingredientes = await select("item_ingrediente", [ "uid", "ingrediente", "itemUid", "createdAt", "sync"], `itemUid='${params.uid}'`, true);
            const etapas = await select("item_etapa", [ "uid", "etapa", "itemUid", "createdAt", "sync"], `itemUid='${params.uid}'`, true);

            console.log(images)
            setData((v: any) => ({
                ...v,
                ...d,
                images: images.map(image => image.image),
                ingredientes: ingredientes.map(ingrediente => ingrediente.ingrediente),
                etapas: etapas.map(etapa => etapa.etapa),
                uid: params.uid,
            }));
        }
    }

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            aspect: [4, 3],
            quality: 1,
        });
        setLoading(true);

        if (!result.canceled) {
            const images = data.images;
            result.assets.forEach((image: any) => {
                images.push(image.uri);
            })
            updateImages(images);
        }
        setLoading(false);
    };

    const updateImages = (images: string[]) => {
        setData((v: any) => ({...v, images: images}));
    }

    function excluirIngrediente(idx) {
      let ingredientes = data.ingredientes;
      ingredientes.splice(idx, 1);
      console.log("teste");
      setData((v: any) => ({...v, ingredientes: ingredientes}));
    }

    function excluirEtapa(idx) {
      let etapas = data.etapas;
      etapas.splice(idx, 1);
      console.log("teste");
      setData((v: any) => ({...v, etapas: etapas}));
    }

    return <Grid style={{
        height: '100%',
        width: '100%',
    }}>
        <Grid>
            <Topbar title="Novo item" back={true} menu={false}/>
        </Grid>
        <Grid style={{
            ...styles.padding
        }}>
            <Text variant="headlineLarge">{ params.uid ? "Editar receita" : "Nova receita" }</Text>
        </Grid>
        <ScrollView>
            <Grid style={{
                ...styles.padding
            }}>
                <TextInput
                    label="Título da receita"
                    value={data.title}
                    onChangeText={(text) => setData((v: any) => ({...v, title: text}))}
                />
            </Grid>
            <Grid style={{...styles.padding}}>
              <Text variant="headlineLarge">Ingredientes</Text>
            </Grid>
            <Grid style={{
                ...styles.padding,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between"
            }}>
                
                <TextInput style={{width: "20%"}}
                    label="Qtd"
                    
                    onChangeText={(text) => setIngrediente((v: any) => ({...v, quantidade : text}))}
                />
                <TextInput style={{width: "75%"}}
                    label="Ingrediente"
                    
                    onChangeText={(text) => setIngrediente((v: any) => ({...v, nome: text}))}
                />
            </Grid>
            <Grid style={{
                ...styles.padding
            }}>
              <Button mode="contained" onPress={adicionarIngrediente}>Adicionar ingrediente</Button>
              {data.ingredientes.map((item, index) => <Grid style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <Text variant={"bodyLarge"} style={{textAlign: "center"}}>{item}</Text>
                <IconButton icon={"pen"} onPress={() => {
                  setIndexIngrediente(index);
                  let ingrediente = data.ingredientes[index];
                  let idx = ingrediente.indexOf(" ");

                  setEditarIngrediente({quantidade: ingrediente.substring(0, idx), nome: ingrediente.substring(idx+1)})
                  setVisible(true);
                }}/>
                <IconButton icon={"close"} onPress={() => {excluirIngrediente(index)}}/>
                </Grid>)}
            </Grid>
            <Grid style={{padding: 16}}>
              <Text variant="headlineLarge">Modo de preparo</Text>
            </Grid>
            <Grid style={{
                ...styles.padding
            }}>
                
                  <TextInput 
                    label="Etapa de preparo"
                    
                    onChangeText={(text) => setEtapa((v: any) => (text))}
                  />
                  <Grid style={{padding: 16}}>
                    <Button mode="contained" onPress={adicionarEtapa}>Adicionar etapa</Button>
                  </Grid>
                
                {data.etapas.map((etapa,index) => <Grid style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                  
                  <Text variant={"bodyLarge"}>{etapa}</Text>
                  <IconButton icon={"pen"} onPress={() => {
                    setIndexEtapa(index);
                    setEditarEtapa(data.etapas[index]);
                    setVisible2(true);
                }}/>
                  <IconButton icon={"close"} onPress={() => {excluirEtapa(index)}}/>
                  </Grid>)}
            </Grid>
            <Grid style={{
                ...styles.padding
            }}>
                <Text variant="headlineSmall">Galeria</Text>
            </Grid>
            <Grid style={{
                ...styles.padding,
                paddingTop: 0,
                flexDirection: 'row',
                flexWrap: 'wrap'
            }}>
                {
                    loading ?
                        <Text>Carregando...</Text>
                        : data.images.map((image: string, index: number) => {
                            return <Grid key={index}
                                         style={{
                                             width: '33.33%',
                                             height: 100,
                                             padding: 5,
                                             position: 'relative'
                                         }}>
                                <Card
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        zIndex: 2,
                                    }}
                                    source={{ uri: image }}/>
                                <IconButton
                                    icon={"close"}
                                    onPress={() => {
                                        setDialogVisible(true);
                                        setImageToDelete(index);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: -15,
                                        right: -15,
                                        zIndex: 2,
                                        backgroundColor: "#fff",
                                    }}/>
                            </Grid>
                        })
                }
            </Grid>
            <Grid style={{
                ...styles.padding,
                display: 'flex',
                flexDirection: 'row',
            }}>
                <Grid style={{
                    ...styles.padding,
                    width: '50%'
                }}>
                    <Button
                        style={{
                            borderRadius: 0,
                            backgroundColor: theme.colors.onTertiaryContainer
                        }}
                        icon="camera"
                        mode="contained"
                        onPress={() => setCameraVisible(true)}>
                        Tirar foto
                    </Button>
                </Grid>
                <Grid style={{
                    ...styles.padding,
                    width: '50%'
                }}>
                    <Button
                        style={{
                            borderRadius: 0,
                            backgroundColor: theme.colors.onSecondaryContainer
                        }}
                        icon="image"
                        mode="contained"
                        onPress={pickImage}>
                        Galeria
                    </Button>
                </Grid>
            </Grid>
            <Grid style={{
                ...styles.padding
            }}>
                <Button
                    style={{
                        borderRadius: 0
                    }}
                    mode="contained"
                    onPress={_update}>
                    {data && data.uid ? "Editar" : "Cadastrar"}
                </Button>
            </Grid>
        </ScrollView>
        <Dialog
            icon={"alert"}
            title={"Excluir imagem"}
            text={"Deseja realmente excluir esta imagem?"}
            visible={dialogVisible}
            setVisibility={setDialogVisible}
            onDismiss={() => setDialogVisible(false)}
            actions={[
                {
                    text: "Cancelar",
                    onPress: () => {
                        setDialogVisible(false);
                        setImageToDelete(null);
                        setMessageText("Ação cancelada");
                    }
                },
                {
                    text: "Excluir",
                    onPress: () => {
                        const images = data.images;
                        images.splice(imageToDelete, 1);
                        updateImages(images);
                        setImageToDelete(null);
                        setMessageText("Imagem excluída com sucesso!");
                        setDialogVisible(false);
                    }
                }
            ]}
        />
        {
            cameraVisible ? <Camera
                onCapture={onCapture}
                setCameraVisible={setCameraVisible}
                ref={cameraRef}
            /> : null
        }
        <Snackbar
            visible={messageText !== null}
            onDismiss={() => setMessageText(null)}
            text={messageText} />
        <Modal visible={visible}>
          <Grid style={{display: "flex", justifyContent: "center", height: "100%"}}>
            <Grid style={{padding: 16}}>
              <Text variant="displaySmall">Editar Ingrediente</Text>
            </Grid>
            <Grid style={{
                ...styles.padding,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between"
            }}>
                
                <TextInput style={{width: "20%"}}
                    label="Qtd"
                    value={editarIngrediente.quantidade}
                    onChangeText={(text) => setEditarIngrediente((v: any) => ({...v, quantidade : text}))}
                />
                <TextInput style={{width: "75%"}}
                    label="Ingrediente"
                    value={editarIngrediente.nome}
                    onChangeText={(text) => setEditarIngrediente((v: any) => ({...v, nome: text}))}
                />
            </Grid>
            <Grid style={{padding: 16}}>
              <Button mode="contained" onPress={() => {
                let ingredientes = data.ingredientes;
                ingredientes[indexIngrediente] = `${editarIngrediente.quantidade} ${editarIngrediente.nome}`;    
                setData((v: any) => ({...v, ingredientes: ingredientes}));
                setVisible(false);
                setIndexIngrediente(null);
              }}>Editar</Button>
            </Grid>
            <Grid style={{padding: 16}}>
              <Button mode="contained" onPress={() => {
                setVisible(false);
                setIndexIngrediente(null);
              }}>Cancelar</Button>
            </Grid>
          </Grid>
        </Modal>
        <Modal visible={visible2}>
          <Grid style={{display: "flex", justifyContent: "center", height: "100%"}}>
            <Grid style={{padding: 16}}>
              <Text variant="displaySmall">Editar Etapa</Text>
            </Grid>
                <Grid style={{padding: 16}}>
                  <TextInput
                    label="Ingrediente"
                    value={editarEtapa}
                    onChangeText={(text) => setEditarEtapa((v: any) => (text))}
                  />
                </Grid>
            
            <Grid style={{padding: 16}}>
              <Button mode="contained" onPress={() => {
                let etapas = data.etapas;
                etapas[indexEtapa] = editarEtapa;    
                setData((v: any) => ({...v, etapas: etapas}));
                setVisible2(false);
                setIndexEtapa(null);
              }}>Editar</Button>
            </Grid>
            <Grid style={{padding: 16}}>
              <Button mode="contained" onPress={() => {
                setVisible2(false);
                setIndexEtapa(null);
              }}>Cancelar</Button>
            </Grid>
          </Grid>
        </Modal>

    </Grid>
}

const styles = {
    containerImage: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    padding: {
        padding: 16
    },
}