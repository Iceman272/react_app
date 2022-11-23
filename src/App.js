import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from 'aws-amplify';
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from '@aws-amplify/ui-react';
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  updateNote as updateNoteMutation,
} from "./graphql/mutations";
import * as XLSX from "xlsx";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";


let subArray = []
const App = ({ signOut }) => {
  const [items, setItems] = useState([]);
  var slideData = [];
  const [ notes, setNotes ] = useState([])
  

  const [state, setState] = useState({
    isPaneOpen: false
  });
  const [stateUntaken, setStateUntaken] = useState({
    isPaneOpen: false
  });

  useEffect(() => {
    fetchNotes();
    console.log("here")
  }, []);

   async function fetchNotes() {
  const apiData = await API.graphql({ query: listNotes });
  const notesFromAPI = apiData.data.listNotes.items;
  await Promise.all(
    notesFromAPI.map(async (note) => {
      return note;
    })
  );
  setNotes(notesFromAPI);
}

   async function createNote(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const data = {
    name: form.get("name"),
    description: form.get("description"),
  };
  await API.graphql({
    query: createNoteMutation,
    variables: { input: data },
  });
  fetchNotes();
  event.target.reset();
}

   async function deleteNote({ id, name }) {
  const newNotes = notes.filter((note) => note.id !== id);
  setNotes(newNotes);
  await Storage.remove(name);
  await API.graphql({
    query: deleteNoteMutation,
    variables: { input: { id } },
  });

}
//fetches only current user's information
 /*
async function UserFetch(currentUser) {
  const apiData = await API.graphql({ query: listNotes, variables: { user: currentUser }});
  const notesFromAPI = apiData.data.listNotes.items;
  await Promise.all(
    notesFromAPI.map(async (note) => {
      return note;
    })
  );
  setNotes(notesFromAPI);
}*/ 

  function getSlidingData(exactCourse){
    if(stateUntaken.isPaneOpen == false){
        console.log("update data");
        setState({ isPaneOpen: true })
    }
  }

  function getUntakenSlidingData(){
    if(state.isPaneOpen == false){
        setStateUntaken({ isPaneOpen: true })
    }
  }

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        const maxRow = 33;
        const minRow = 8;
        let tempA = data.slice(minRow <= 7 ? 0 : minRow - 2);
        //crn
        const A1 = tempA.map(x => x['Bachelor of Science in Computer Science']);
        //name
        const A2 = tempA.map(x => x['__EMPTY_1']);
        //credits
        const A3 = tempA.map(x => x['__EMPTY_2']);
        //grade
        const A4 = tempA.map(x => x['__EMPTY_3']);
        const B1 = tempA.map(x => x['__EMPTY_6']);
        const B2 = tempA.map(x => x['__EMPTY_7']);
        const B3 = tempA.map(x => x['__EMPTY_8']);
        const B4 = tempA.map(x => x['__EMPTY_9']);

        var newArray = []
        
        for (let step = 0; step < 6; step++) {
            newArray[step] = new Array(A1[step],A2[step],A3[step],A4[step],true);   
        }
        for (let step = 0; step < 5; step++) {
            newArray[newArray.length] = new Array(B1[step],B2[step],B3[step],B4[step],true);   
        }

        for (let step = 9; step < 14; step++) {
            newArray[newArray.length] = new Array(A1[step],A2[step],A3[step],A4[step],true);   
        }
        for (let step = 9; step < 15; step++) {
            newArray[newArray.length] = new Array(B1[step],B2[step],B3[step],B4[step],true);   
        }

        for (let step = 18; step < 23; step++) {
            newArray[newArray.length] = new Array(A1[step],A2[step],A3[step],A4[step],true);   
        }
        for (let step = 18; step < 23; step++) {
            newArray[newArray.length] = new Array(B1[step],B2[step],B3[step],B4[step],true);   
        }

        for (let step = 25; step < 30; step++) {
            newArray[newArray.length] = new Array(A1[step],A2[step],A3[step],A4[step],true);   
        }
        for (let step = 25; step < 30; step++) {
            newArray[newArray.length] = new Array(B1[step],B2[step],B3[step],B4[step],true);   
        }

        newArray.forEach( function(data) {
            data['crn'] = data['0'];
            delete data['0'];
            data['name'] = data['1'];
            delete data['1'];
            data['credits'] = data['2'];
            delete data['2'];
            data['grade'] = data['3'];
            delete data['3'];

            data['taken'] = data['4'];
            delete data['4'];
        });


        //subArray= newArray.filter(x => x !== undefined);
        let z= 0;
        //make subArray for untaken classes
        for(let i = 0; i < newArray.length; i++){
            if(newArray[i]['grade'] === undefined){

                newArray[i]['taken'] = false
                subArray[z] = new Array(newArray[i]['crn'],newArray[i]['name'],newArray[i]['credits'],newArray[i]['grade'],newArray[i]['taken']);
                z++;
            }
        }

        subArray.forEach( function(data) {
            data['crn'] = data['0'];
            delete data['0'];
            data['name'] = data['1'];
            delete data['1'];
            data['credits'] = data['2'];
            delete data['2'];
            data['grade'] = data['3'];
            delete data['3'];

            data['taken'] = data['4'];
            delete data['4'];
        });
        


        console.log(subArray);

        //console.log(newArray);
        resolve(newArray);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      console.log(d);

      //empty array 
      //items = [];

      //upload d to database

      //refill array with new data 
      setItems(d);

      // update database

      //refresh array with stuff from the database
      //getData();
    });
  };

  return (
    <div>
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View
  name="image"
  as="input"
  type="file"
  style={{ alignSelf: "end" }}
/>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
  <Flex
    key={note.id || note.name}
    direction="row"
    justifyContent="center"
    alignItems="center"
  >
    <Text as="strong" fontWeight={700}>
      {note.name}
    </Text>
    <Text as="span">{note.description}</Text>
    
    <Button variation="link" onClick={() => deleteNote(note)}>
      Delete note
    </Button>
  </Flex>
))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          readExcel(file);
        }}
      />

      <button onClick={() => getSlidingData('CSCI-120') }>
        Click me to open right pane!
      </button>

      <button onClick={() => getUntakenSlidingData() }>
        Click me to open Untaken Class!
      </button>
      

      <SlidingPane
        className="some-custom-class"
        overlayClassName="some-custom-overlay-class"
        isOpen={state.isPaneOpen}
        title="Course Details"
        subtitle="Optional subtitle."
        width={window.innerWidth < 600 ? "100%" : "500px"}
        onRequestClose={() => {
          // triggered on "<" on left top click or on outside click
          setState({ isPaneOpen: false });
        }}
      >
        <div class="Detail_info">
            <div class="Detail_Name">
                <h1>slideData[2]</h1>
                <p>slideData[0]</p>
            </div>
            <div class="Detail_section">
                <h4>Prerequisite: </h4>
                <p>slideData[3]</p>
                <h4>credits: </h4>
                <p>slideData[1]</p>
            </div>
            <div class="Detail_semester">
                <h4>Associated semester:</h4>
                <p>slideData[4]</p>
            </div>
            <div class="Detail_Summary">
                <h4>Course Description:</h4>
                <pre>
                slideData[5]
                </pre>
            </div>
        </div>

        <br />
      </SlidingPane>

      <SlidingPane
        className="some-custom-class"
        overlayClassName="some-custom-overlay-class"
        isOpen={stateUntaken.isPaneOpen}
        title="Untaken Courses"
        subtitle="Optional subtitle."
        width={window.innerWidth < 600 ? "100%" : "500px"}
        onRequestClose={() => {
          // triggered on "<" on left top click or on outside click
          setStateUntaken({ isPaneOpen: false });
        }}
      >
        <div>
            <table class="table container 2">
        <thead>
          <tr>
            <th scope="col">CRN</th>
            <th scope="col">Name</th>
            <th scope="col">Credits</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>
          {subArray.map((d) => (
            <tr key={d.Item}>
              <th>{d['crn']}</th>
              <td>{d['name']}</td>
              <td>{d['credits']}</td>
              <td>{d['grade']}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      </SlidingPane>

      <table class="table container">
        <thead>
          <tr>
            <th scope="col">CRN</th>
            <th scope="col">Name</th>
            <th scope="col">Credits</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.Item}>
              <th>{d['crn']}</th>
              <td>{d['name']}</td>
              <td>{d['credits']}</td>
              <td>{d['grade']}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>not taken courses </h3>

      <table class="table container 2">
        <thead>
          <tr>
            <th scope="col">CRN</th>
            <th scope="col">Name</th>
            <th scope="col">Credits</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>
          {subArray.map((d) => (
            <tr key={d.Item}>
              <th>{d['crn']}</th>
              <td>{d['name']}</td>
              <td>{d['credits']}</td>
              <td>{d['grade']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default withAuthenticator(App);