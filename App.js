import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Image, TextInput, Alert} from 'react-native';
import React,{useState,useEffect} from 'react';
import { Feather } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

// 핸드폰의 width와 height를 가져온다
const {width: SCREEN_WIDTH} = Dimensions.get("window");
const API_KEY = "ac53f7e6e8174f06beb0541bef653907";
const STORAGE_KEY = "@toDos";

export default function App() {
  const [menus, setMenus] = useState([]);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s));
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = (key) => {
    Alert.alert("Delete Ingredient", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };
  
  // 레시피 가져오기
  const getRecipe = async() => {
    // text 가져오기 드디어 됐다ㅠㅠㅠ
    let linkText = [];
    if (toDos) {
      Object.keys(toDos).map((key) => 
      linkText = linkText.concat(`+${toDos[key].text},`),
      linkText = linkText.toString()
    )}
    // 재료들을 가지고 id를 받아온 다음
    const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${linkText}&apiKey=${API_KEY}&includeNutrition=true&number=7`);
    const json = await response.json();
    console.log(json);
    console.log(linkText);
    setMenus(json);
    // 이 재료들로 만들 수 있는 요리 추천해주기
  }

  useEffect(() => {
    loadToDos();
    // loadMix();
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Recipes</Text>
      <TextInput
        onSubmitEditing={() => {
          addToDo();
        }
        }
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder="What do you have?"
        style={[styles.inputDefault, styles.input]}
      />
      <View style={styles.toDos}>
        {toDos == null ? (
          <View></View>
        ): ( 
            Object.keys(toDos).map((key) =>
              <View key={key}>
                <TouchableOpacity style={styles.toDo} onPress={() => deleteToDo(key)}>
                  <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  <Feather name="x" size={10} color="#fff" />
                </TouchableOpacity>
              </View>
          )
        )}
        
      </View>
      <TouchableOpacity onPress={getRecipe}>
        <Text style={[styles.inputDefault, styles.button]}>SEARCH</Text>
      </TouchableOpacity>

      {/* 메뉴 서칭 결과 */}
      {/* horizontal로 배열하면 style -> contentContainerstyle */}
      <ScrollView 
      pagingEnabled
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerstyle={styles.inf}>
        {/* 로딩 페이지 만들기 */}
        {menus.length == 0 ? (
        <View style = {styles.box}>
          <ActivityIndicator color="#fff" size="large" style={{marginTop:10,}}/>
        </View>
        ) : (
          menus.map((menu, index) => 
          <View key = {index} style = {styles.box}>
            <View>
              <Text style={styles.secondTitle}>
                {menu.title}
              </Text>
              {/* 중요! object 안에 object를 가져오는 방법 : map을 한번 더 써준다 */}
              <ScrollView>
                <Image
                  style={styles.image}
                  source={{
                   uri: menu.image,
                  }}
                />
                <Text style={styles.secondTitle}>Need More...</Text>
                  {menu.missedIngredients.map((need) => 
                  <View style={styles.need}>
                    <TouchableOpacity>
                      <Text style={styles.needText} key = {index} >
                          {need.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  )}
                  <TouchableOpacity
                  onPress={() => Linking.openURL(`https://spoonacular.com/${menu.title.replace(/ /,"-").replace(/&/,"-").replace(/","/,"-")}-${menu.id}`)}
                  style={styles.needText}>
                    <Text style={{...styles.button, padding: 10, fontSize: 18, borderRadius: 30}}>Recipe</Text>
                  </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
          )
        )}
        
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

// 자동완성을 위해 StyleSheet.create를 사용함
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 60,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  title: {
    textAlign : 'center',
    color: "#fff",
    fontSize: 48,
    marginBottom : 30,
  },
  secondTitle:{
    color: "#fff",
    fontSize: 28,
    marginBottom : 10,
  },
  inf:{
    flex:3,
  },
  image:{
    width: SCREEN_WIDTH-80,
    height: SCREEN_WIDTH-100,
    resizeMode: 'contain',
    borderRadius: 20,
  },
  need: {
    flex:1,    
    flexDirection: 'row',
  },
  needText: {
    color: '#fff',
  },
  box:{
    margin:30,
    borderRadius: 30,
    width: SCREEN_WIDTH-60,
    height: SCREEN_WIDTH-30,
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 입력란
  inputDefault: {
    borderRadius: 30,
    marginHorizontal: 40,
    padding: 10,
    fontSize: 18,
  },
  input:{
    backgroundColor: "white",
  },
  button:{
    color: "#fff",
    textAlign : 'center',
    backgroundColor: "#faa307",
    marginTop: 30,
  },
  toDos:{
    marginHorizontal: 40,
    flexDirection: "row",
    flexWrap:'wrap',
  },
  toDo: {
    backgroundColor: "#495057",
    marginTop: 20,
    marginHorizontal: 3,
    padding: 3,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 11,
    fontWeight: "400",
    paddingHorizontal: 10,
  },
});
