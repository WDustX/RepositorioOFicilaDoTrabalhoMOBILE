import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import SyncStorage from 'sync-storage';

const PilhaTelas = createNativeStackNavigator();
const URL_API = `https://jsonplaceholder.typicode.com/posts`;
const URL_API2 = `https://jsonplaceholder.typicode.com/posts/`;

function TelaInicial({ navigation }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(URL_API);
                const json = await response.json();
                setPosts(json);
            } catch {
                Alert.alert('Erro ao carregar posts');
            }
        };
        fetchPosts();
    }, []);

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.headerText}>Tela Inicial</Text>
               
                <TouchableOpacity 

                    style={styles.favoriteButton}
                    onPress={() => navigation.navigate("Favoritos")}

                >

                    <Text style={styles.favoriteButtonText}>Favoritos</Text>
                
                </TouchableOpacity>
                {posts.map(post => (
                    <View key={post.id} style={styles.cardContainer}>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Título: {post.title}</Text>
                        </View>
                        <Button
                            title='VER'
                            color="red"
                            onPress={() => navigation.navigate("VisualizarUsuario", { id: post.id })}
                        />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}
function Favorito({ navigation }) {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const carregarFav = async () => {
            try {
                const fav = SyncStorage.get('favorites') ? JSON.parse(SyncStorage.get('favorites')) : [];
                setFavorites(fav);
            } catch (error) {
                console.error('Erro ao recuperar dados:', error);
            }
        };
        carregarFav();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Favoritos</Text>
            {favorites.length > 0 ? (
                favorites.map((fav, index) => (
                    <TouchableOpacity 

                    key={fav.id} 
                    onPress={() => navigation.navigate("VisualizarUsuario", { id: fav.id })}

                    >
                        <View key={index} style={styles.commentContainer}>
                        
                        <Text style={styles.commentName}>Título: {fav.title}</Text>
                        <Text style={styles.commentEmail}>Descrição: {fav.body}</Text>
                        
                       
                    </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.emptyMessage}>Nenhum favorito encontrado.</Text>
            )}
        </View>
    );
}

function VisualizarUsuario({ route }) {
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`${URL_API}/${route.params.id}`);
                const json = await response.json();
                setPost(json);

                const favorites = SyncStorage.get('favorites') ? JSON.parse(SyncStorage.get('favorites')) : [];
                setIsFavorite(favorites.some(fav => fav.id === json.id));
            } catch {
                Alert.alert('Erro ao carregar post');
            }
        };
        fetchPost();
    }, [route.params.id]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`${URL_API2}${route.params.id}/comments`);
                const json = await response.json();
                setComments(json);
            } catch {
                Alert.alert('Erro ao carregar comentários');
            }
        };
        fetchComments();
    }, [route.params.id]);

    const handleFavoriteToggle = async () => {
        try {
            const favorites = SyncStorage.get('favorites') ? JSON.parse(SyncStorage.get('favorites')) : [];
            const favoritePost = { id: post.id, title: post.title, body: post.body };

            if (isFavorite) {
                const updatedFavorites = favorites.filter(fav => fav.id !== post.id);
                await SyncStorage.set('favorites', JSON.stringify(updatedFavorites));
                setIsFavorite(false);
            } else {
                favorites.push(favoritePost);
                await SyncStorage.set('favorites', JSON.stringify(favorites));
                setIsFavorite(true);
            }
        } catch {
            Alert.alert('Erro ao atualizar favoritos');
        }
    };

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.headerText}>Detalhes do Post</Text>
                <View style={styles.detailsContainer}>
                    <Text style={styles.postTitle}>Título: {post.title}</Text>
                    <Text style={styles.postBody}>Corpo: {post.body}</Text>
                    <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favoriteButton}>
                        <Text style={styles.favoriteButtonText}>
                            {isFavorite ? 'Desmarcar como Favorito' : 'Marcar como Favorito'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.commentsHeader}>Comentários:</Text>
                {comments.map(comment => (
                    <View key={comment.id} style={styles.commentContainer}>
                        <Text style={styles.commentName}>Nome: {comment.name}</Text>
                        <Text style={styles.commentEmail}>Descrição: {comment.body}</Text>
                        <Text style={styles.commentEmail}>Email: {comment.email}</Text>

                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <PilhaTelas.Navigator>
                <PilhaTelas.Screen
                    name="TelaInicial"
                    component={TelaInicial}
                    options={{ title: "Tela Inicial" }}
                />
                <PilhaTelas.Screen
                    name="VisualizarUsuario"
                    component={VisualizarUsuario}
                    options={{ title: "Visualizar Detalhes" }}
                />
                <PilhaTelas.Screen
                    name="Favoritos"
                    component={Favorito}
                    options={{ title: "Ver Favoritos" }}
                />
            </PilhaTelas.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        alignItems: "center",
        padding: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    cardContainer: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    detailsContainer: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    postTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    postBody: {
        fontSize: 16,
        marginVertical: 10,
    },
    favoriteButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#ffcc00',
        borderRadius: 5,
        alignSelf: 'center',
        marginVertical: 10,
    },
    favoriteButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    commentsHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    commentContainer: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    commentName: {
        fontSize: 16,
        fontWeight: '600',
    },
    commentEmail: {
        fontSize: 14,
        color: '#555',
    },
    emptyMessage: {
        fontSize: 16,
        color: '#888',
        marginTop: 20,
    },
    
    cardContainerdois: {
        width: "100%",
        
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    favoriteButton: {
        width: '100%', // Preencher a largura da tela
        padding: 15, // Aumentar a altura
        backgroundColor: 'purple', // Cor de fundo
        borderRadius: 5, // Bordas arredondadas
        alignItems: 'center', // Centraliza o texto
        marginBottom: 20, // Espaço abaixo do botão
    },
    favoriteButtonText: {
        color: '#fff', // Cor do texto
        fontSize: 18, // Tamanho da fonte
        fontWeight: 'bold', // Negrito
    },
    
    
    
});
