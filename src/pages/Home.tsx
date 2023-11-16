import React, { useState, useEffect, useCallback } from 'react';
import {
  chakra,
  Button,
  List,
  ListItem,
  Heading,
  Flex,
  Input,
  Text,
} from '@chakra-ui/react';

export const Home = () => {
  const [todos, setTodos] = useState([]); //наши элементы - массив с задачами
  const [text, setText] = useState(''); // сама задача (ввод)
  const [sortType, setSortType] = useState('name'); //сортировка
  const [filterType, setFilterType] = useState('all'); //фильтрация 

  useEffect(() => { //функция загружает задачи из  localStorage  при первоначальной загрузке компонента
    const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    setTodos(storedTodos); // обновляет состояние переменной  todos  с полученными задачами
  }, []);

  const updateTodos = useCallback((newTodos) => { //обновление состояния переменной  todos  в компоненте и сохранение обновленных задач в  localStorage
    setTodos(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  }, []);

  const createTodoHandler = useCallback((text) => {
    if (text.trim().length === 0) { //проверяет содержит ли строка что-то
      return;
    }
    const newTodo = { id: Date.now(), text, completed: false }; //задаёт уникальный айди нашему элементу 
    const newTodos = [...todos, newTodo]; //добавляет нашу задачу и уже сущ. в массив:a = [1,2,3] => b = [...[1,2,3], 4,5,6] = [1,2,3,4,5,6]
    updateTodos(newTodos); //заменяет старый массив на новый 
    setText('');
  }, [todos, updateTodos]);
  

  const removeTodoHandler = useCallback((id) => { 
    const newTodos = todos.filter((todo) => todo.id !== id); //ищёт среди задач именно ту самую с переданным id, возвращая все кроме неё 
    updateTodos(newTodos);
  }, [todos, updateTodos]);

  const toggleTodoCompletion = useCallback((id) => {
    const updatedTodos = todos.map((todo) => { //map проходится по всем элементам и возвращает эл. с id и изменённым состоянием на completed
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    updateTodos(updatedTodos);
  }, [todos, updateTodos]);

  const exportTodoHandler = useCallback(() => {
    const exportData = JSON.stringify(todos, null, 2); //переменная, в которую грузятся задачи в формате JSON без преобразований (null)
    const blob = new Blob([exportData], { type: 'application/json' }); //наш объект (бинарные данные) содержащий строку 
    const url = URL.createObjectURL(blob);//создание ссылки на скачивание файла
    const a = document.createElement('a');
    a.href = url; //элемент через который реализуем скачивание 
    a.download = 'todos.json';
    document.body.appendChild(a); //создание и удаление элемента в теле 
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [todos]);

  const [searchText, setSearchText] = useState('');

  const importTodoHandler = useCallback((event) => {
    const fileReader = new FileReader(); //объект читающий файл 
    fileReader.onload = (e) => { //обработчик события(при загрузке файла)
      try {
        const importedTodos = JSON.parse(e.target.result);//получает элементы из файла и преобразует их в формат JS
        const newTodos = [...todos, ...importedTodos];//новый массив который объединяет новые и старые задачи
        updateTodos(newTodos);
      } catch (error) { //если в блоке выше происходит ошибка, выполнение переходит сюда
        console.error('Error importing tasks:', error);//выводит сообщение и саму ошибку
      }
    };
    fileReader.readAsText(event.target.files[0]); //чтение содержимого выбранного файла
  }, [todos, updateTodos]);

  const handleSortTypeChange = useCallback((type) => {//принимает тип сортировки
    setSortType(type);//обновляет переменную sotrtype в зависимости от выбранного типа
  }, []);

  const sortedTodos = todos.slice().sort((a, b) => {//создаёт сортированный массив по правилу ниже
    if (sortType === 'name') {
      return a.text.localeCompare(b.text);//сортировка по тексту
    } else if (sortType === 'status') {//по статусу 
      return a.completed - b.completed;
    }
    return 0;
  });

  function ClearTodos() {
    localStorage.clear();
    setTodos([]);
  }

  return (
    <Flex
      flexDirection="column"
      h="100vh"
      w="100vw"
      m="1rem"
      gap="1rem"
      alignItems="center"
    >
      <Heading textTransform="uppercase">Заметки</Heading>
      <div style={{ display: 'flex', gap: '1rem' }}>
      <Button onClick={() => handleSortTypeChange('name')}
      background="green.300"
      color="white"
      _hover={{
        background: 'red.300',
      }}>
        Сортировать по имени
      </Button>

      <Button onClick={() => handleSortTypeChange('status')}
      background="green.300"
      color="white"
      _hover={{
        background: 'red.300',
      }}>
        Сортировать по состоянию
      </Button>
      <Button
          type="submit"
          background="red.500"
          color="white"
          _hover={{
            background: 'red.600',
          }}
          onClick={ClearTodos}
        >
          Очистить задачи 
        </Button>
      </div>
      <Input
  placeholder="Поиск задач"
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
  w="300px"
  h="32px"
/>
      <List
        h="70vh"
        w="35vw"
        display="flex"
        flexDirection="column"
        overflowY="scroll"
        border="2px solid black"
        borderRadius="md"
        p="10px"
      >
       {sortedTodos.map((todo) => {
  if (todo.text.includes(searchText)) {
    return (
          <ListItem
            key={todo.id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom="1px solid gray"
            py="8px"
          >
            <Flex alignItems="center">
              <Button
                size="sm"
                onClick={() => toggleTodoCompletion(todo.id)}//меняет состояние задачи 
                p="0"
                mr="2"
              >
                {todo.completed ? '✓' : ''}
              </Button>
              <Text>{todo.text}</Text>
            </Flex>
            <Button
              onClick={() => removeTodoHandler(todo.id)}
              background="red.500"
              color="white"
              _hover={{
                background: 'red.600',
              }}
            >
              Удалить
            </Button>
            </ListItem>
            );
          }
          return null;
        })}
      
      </List>
      <chakra.form
        onSubmit={(e) => {
          e.preventDefault(); // Без перезагрузки приложения после добавления задачи
          createTodoHandler(text);
        }}
        display="flex"
        alignItems="center"
        gap="20px"
      >
        
        <Input
          placeholder="Напишите задачу..."
          maxLength={80}
          value={text}
          onChange={(e) => setText(e.target.value)}
          w="300px"
          h="32px"
        />
        <Button
          isDisabled={!text.trim().length} //закрывает доступ к кнопке, если элемент пуст (или содержит только пробелы)
          type="submit"
          w="fit-content"
          background="blue.500"
          color="white"
          width="250px"
          _hover={{
            background: 'blue.600',
          }}
        >
          Добавить задачу
        </Button>
      </chakra.form>
      <div style={{ display: 'flex', gap: '1rem' }}
      >
        <Button
          type="submit"
          w="fit-content"
          background="yellow.500"
          color="white"
          _hover={{
            background: 'red.400',
          }}
        >
          <label htmlFor="importFile">Импортировать задачи</label>  {/* связывает метку с элементом формы по идентификатору */}
          <input
            type="file"
            id="importFile"
            accept=".json"
            style={{ display: 'none' }} // позволяет пользователю выбирать файлы на своем устройстве для импорт
            onChange={importTodoHandler} // при изменениях вызвыает функцию 
          />
        </Button>
        <Button
          type="submit"
          w="fit-content"
          background="yellow.500"
          color="white"
          _hover={{
            background: 'red.400',
          }}
          onClick={exportTodoHandler}
        >
          Экспортировать задачи
        </Button>
      </div>
    </Flex>
  );
};