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

//exports array of course data 
export const courseData =[];

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

  //on load fetch the data from api
  useEffect(() => {
    fetchNotes();
  }, []);

  //function that gets courses from API
   async function fetchNotes() {
  const apiData = await API.graphql({ query: listNotes });
  const notesFromAPI = apiData.data.listNotes.items;
  await Promise.all(
    notesFromAPI.map(async (note) => {
      return note;
    })
  );
  //addes results to notes array
  setNotes(notesFromAPI);
  
  //update courseData
  updateExportData();
  console.log("data fetch")
  console.log(courseData);
}
    //function that adds new courses to the database
   async function createNote({order_number, course_name,course_number, credit, grade, taken, semester_taken }) {
  const data = {
                order_number: order_number,
                course_name: course_name,
                course_number: course_number,
                credit: credit,
                grade: grade,
                taken: taken,
                semester_taken: semester_taken,
                };
  await API.graphql({
    query: createNoteMutation,
    variables: { input: data },
  });
  //fetches new array of data from database
  fetchNotes();
}

    //funtion to detele an entry from the database
   async function deleteNote({ id, course_name }) {
  const newNotes = notes.filter((note) => note.id !== id);
  setNotes(newNotes);
  await Storage.remove(course_name);
  await API.graphql({
    query: deleteNoteMutation,
    variables: { input: { id } },
  });

}
//funtion to update an element in the database
async function updateData({ id, order_number, course_name,course_number, credit, grade, taken, semester_taken }){
    const data = {
                id: id,
                order_number: order_number,
                course_name: course_name,
                course_number: course_number,
                credit: credit,
                grade: grade,
                taken: taken,
                semester_taken: semester_taken,
                };
  await API.graphql({
    query: updateNoteMutation,
    variables: { input: data },
  });
  //fetches new array of data from database
  fetchNotes();
}

//possible to be reworked or deleted. Creat function for loops
async function tempCreateNote() {
for(let i = 0; i < notes.length; i++){
  const data = {
                order_number: i,
                course_name: notes[i]['course_name'],
                course_number: notes[i]['course_number'],
                credit: notes[i]['credits'],
                grade: notes[i]['grade'],
                taken: notes[i]['taken'],
                semester_taken: notes[i]['semester_taken'],
                };
  await API.graphql({
    query: createNoteMutation,
    variables: { input: data },
  });}
  fetchNotes();
}

//[not working]fetches only current user's information
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

  //[not working] function to update courseData with current data from the database  
  function updateExportData(){
  console.log(notes.length)
    for(let i = 0; i < notes.length; i++){
        courseData[i]= new Array(i,
                notes[i]['course_name'],
                notes[i]['course_number'],
                notes[i]['credits'],
                notes[i]['grade'],
                notes[i]['taken'],
                notes[i]['semester_taken']);
    }
    
  }

  //function to reads the excel file and convert data to array
  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        //raw data from exel cells
        const data = XLSX.utils.sheet_to_json(ws);

        const maxRow = 33;
        const minRow = 8;
        //remove needlet string variables from data
        let tempA = data.slice(minRow <= 7 ? 0 : minRow - 2);
        
        //columns from remaining data
        //course_number
        const A1 = tempA.map(x => x['Bachelor of Science in Computer Science']);
        //course_name
        const A2 = tempA.map(x => x['__EMPTY_1']);
        //credits
        const A3 = tempA.map(x => x['__EMPTY_2']);
        //grade
        const A4 = tempA.map(x => x['__EMPTY_3']);
        const B1 = tempA.map(x => x['__EMPTY_6']);
        const B2 = tempA.map(x => x['__EMPTY_7']);
        const B3 = tempA.map(x => x['__EMPTY_8']);
        const B4 = tempA.map(x => x['__EMPTY_9']);
        console.log(A4)

        //new array to store the data columns 
        var newArray = []
        
        //for loops loop through data and skips rows that have needless string titles 
        for (let step = 0; step < 6; step++) {
            newArray[step] = new Array(A1[step],A2[step],A3[step],A4[step],true,step);   
        }
        for (let step = 0; step < 5; step++) {
            newArray[newArray.length] = new Array(B1[step],B2[step],B3[step],B4[step],true,step,"");   
        }

        for (let step = 9; step < 14; step++) {
            newArray[newArray.length] = new Array(A1[step],A2[step],A3[step],A4[step],true,step,"");   
        }
        for (let step = 9; step < 15; step++) {
            newArray[newArray.length] = new Array(B1[step],B2[step],B3[step],B4[step],true,step,"");   
        }

        for (let step = 18; step < 23; step++) {
            newArray[newArray.length] = new Array(A1[step],A2[step],A3[step],A4[step],true,step,"");   
        }
        for (let step = 18; step < 23; step++) {
            newArray[newArray.length] = new Array(B1[step],B2[step],B3[step],B4[step],true,step,"");   
        }

        for (let step = 25; step < 30; step++) {
            newArray[newArray.length] = new Array(A1[step],A2[step],A3[step],A4[step],true,step,"");   
        }
        for (let step = 25; step < 30; step++) {
            newArray[newArray.length] = new Array(B1[step],B2[step],B3[step],B4[step],true,step,"");   
        }

        //rename columns of array to relate to what they are storying 
        newArray.forEach( function(data) {
            data['course_number'] = data['0'];
            delete data['0'];
            data['course_name'] = data['1'];
            delete data['1'];
            data['credits'] = data['2'];
            delete data['2'];
            data['grade'] = data['3'];
            delete data['3'];

            data['taken'] = data['4'];
            delete data['4'];

            data['order_number'] = data['5'];
            delete data['5'];

            data['semester_taken'] = data['6'];
            delete data['6'];
        });

        let z= 0;
        //loop to establish untaken classes by checking if they have a grade
        for(let i = 0; i < newArray.length; i++){
            if(newArray[i]['grade'] === undefined){

                newArray[i]['taken'] = false
                subArray[z] = new Array(newArray[i]['course_number'],newArray[i]['course_name'],newArray[i]['credits'],newArray[i]['grade'],newArray[i]['taken']);
                
                z++;
            } 
            //[needs fixing] adds data 
            //checks if any fetched data[x][course name]||[course number]== newArray[i][course name]||[course number]
            //if true update else createNote
            createNote(newArray[i]);
            courseData[i] = new Array(newArray[i]['course_number'],newArray[i]['course_name'],newArray[i]['credits'],newArray[i]['grade'],newArray[i]['taken']);
        }
          

        subArray.forEach( function(data) {
            data['course_number'] = data['0'];
            delete data['0'];
            data['course_name'] = data['1'];
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

        //if no errors then outputing newArray to promise
        resolve(newArray);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      console.log(d);

      //Sets Array with outputed data 
      setItems(d);

      // update database

    });
  };

  return (
    <div>
    <View className="App">
      <Heading level={1}>AWS Working Test</Heading>
      
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="order_number"
            placeholder= "order_number"
            label="Note order number"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="course_name"
            placeholder="Course Name"
            label="Note name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="course_number"
            placeholder="Bio 101"
            label="Note course number"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="credit"
            placeholder= "credit"
            label="Note credit"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="grade"
            placeholder="grade"
            label="Note grade"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="taken"
            placeholder= "bool"
            label="Note taken"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="semester_taken"
            placeholder="spring"
            label="Note semester_taken"
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
      {note.course_name}
    </Text>
    <Text as="span">{note.course_number}</Text>
    <Text as="span">{note.credit}</Text>
    <Text as="span">{note.grade}</Text>
    <Text as="span">{note.taken}</Text>
    <Text as="span">{note.semester_taken}</Text>
    <Text as="span">{note.order_number}</Text>
    
    <Button variation="link" onClick={() => deleteNote(note)}>
      Delete note
    </Button>
    <Button variation="link" onClick={() => updateData(note)}>
      Update note
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
            <th scope="col">course_number</th>
            <th scope="col">Name</th>
            <th scope="col">Credits</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>
          {subArray.map((d) => (
            <tr key={d.Item}>
              <th>{d['course_number']}</th>
              <td>{d['course_name']}</td>
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
            <th scope="col">course_number</th>
            <th scope="col">Name</th>
            <th scope="col">Credits</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.Item}>
              <th>{d['course_number']}</th>
              <td>{d['course_name']}</td>
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
            <th scope="col">course_number</th>
            <th scope="col">Name</th>
            <th scope="col">Credits</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>
          {subArray.map((d) => (
            <tr key={d.Item}>
              <th>{d['course_number']}</th>
              <td>{d['course_name']}</td>
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