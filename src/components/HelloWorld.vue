<template>
  <v-layout row wrap style="padding:30px;">
    <v-flex xs12>
      <div style="text-align:end">
        {{userName}}
        <v-btn dark color="purple" v-on:click="logout">Log out</v-btn>
      </div>
    </v-flex>
    <v-flex d-flex>
      <v-card>
        <v-card-title>
          <h2>Custom Model</h2>
        </v-card-title>
        <v-divider></v-divider>
        <v-window v-model="toggle">
          <v-window-item :value="false">
            <v-card-text>
              PoseKey encourages users to use Posekey in creative ways!<br>
              Therefore users can change default poses into their own unique poses by using a custom AI model.<br>
              Don't Worry, you only need to press few buttons to train your own AI model.<br>
              To create a custom model, please click the button below!<br>
              Default model can still be used that you can change the setting in popup page.<br>
              <br>
              <v-btn color="primary" @click="toggle=true">Custom Model</v-btn>
            </v-card-text>
            <!-- <v-divider></v-divider>
            <v-card-actions>
              <v-btn color="primary">Custom Model</v-btn>
              <v-switch v-model="toggle"></v-switch>
            </v-card-actions> -->
          </v-window-item>
          <v-window-item :value="true">
            <v-list subheader>
              <!-- <v-subheader><strong class="primary--text">Customize model</strong></v-subheader> -->
              
              <v-divider></v-divider>
              <v-list-tile
                v-for="item in customd"
                :key="item.id"
                avatar
              >
                <v-list-tile-content>
                  <v-form ref="form">
                    <v-text-field
                      v-model="item.Description"
                      label="Describe your pose please"
                    ></v-text-field>
                  </v-form>
                </v-list-tile-content>
                <span>Example Count: {{item.count}}</span>
                <v-btn flat color="purple" :disabled="!toggle" @click="(event) => { clearClass(event, item.id-1) }">Clear</v-btn>
                <v-btn flat color="purple" :disabled="!toggle" @mousedown="(event) => {trainClass(event, item.id-1)}" @mouseup="(event) => {trainClass(event, -1);updateCount(item.id-1);}">Train</v-btn>
              </v-list-tile>
            </v-list>
            <v-card-actions>
              <v-btn dark color="purple" @click="save">Complete</v-btn>
            </v-card-actions>
          </v-window-item>
        </v-window>
      </v-card>
    </v-flex>
    <v-flex>
      <v-card>
        <v-card-title>
          <h2>Mirror</h2>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-media>
          <canvas id="output" width="640" height="480"></canvas>
        </v-card-media>
      </v-card>
    </v-flex>
  </v-layout>
  <!-- <div>
    <v-card>
        <v-card-media>
        <canvas id="output" width="640" height="480"></canvas>
        </v-card-media>
        <v-card-actions>
          <v-btn dark color="purple" v-on:click="logout">Log out</v-btn>
        </v-card-actions>
    </v-card>
        <v-switch
          color="purple"
          v-model="toggle">
          <template slot="label">
            <strong class="primary--text">Use Custom Model</strong>
          </template>  
        </v-switch>
        <v-tooltip right>
          <template #activator="data">
            <v-btn flat icon v-on="data.on" color="purple">
              <v-icon>help</v-icon>
            </v-btn>
          </template>
          <span>asdfadfasdfasdfasfd asdfasfdasdfas dfasdfasdf asdf asdf safs dfsd fasdfasdf asdfas dfs fsf dfa dafsa fs dfs df dsfsdf asdfsfsdf asdfsfa dfad f asdf asfda sfdsa fsd fsaf ds sdfasdfad dadfdaf adfs</span>
        </v-tooltip>
        <v-card>        
          <v-list subheader>
            <v-subheader><strong class="primary--text">Customize model</strong></v-subheader>
            <v-list-tile
              v-for="item in customd"
              :key="item.id"
              avatar
            >
              <v-list-tile-content>
                <v-form ref="form">
                  <v-text-field
                    v-model="item.Description"
                    label="Describe your pose please"
                  ></v-text-field>
                </v-form>
              </v-list-tile-content>
              <v-btn flat color="purple" :disabled="!toggle" @click="(event) => { clearClass(event, item.index) }">Clear</v-btn>
              <v-btn flat color="purple" :disabled="!toggle" @mousedown="(event) => {trainClass(event, item.index)}" @mouseup="(event) => {trainClass(event, -1)}">Train</v-btn>
            </v-list-tile>
          </v-list>
          <v-card-actions>
            <v-btn dark color="purple" @click="save">Complete</v-btn>
          </v-card-actions>
        </v-card>
  </div> -->
</template>

<script>
  import * as posenet from '@tensorflow-models/posenet';
  import * as utils from "../util";
  import "@babel/polyfill";
  import * as mobilenetModule from '@tensorflow-models/mobilenet';
  import * as tf from '@tensorflow/tfjs';
  import * as knnClassifier from '@tensorflow-models/knn-classifier';
  import {mapState} from 'vuex'
  import store from '../store'
  
  let net;
  let knn;
  let mobilenet;

  let video;
  let width = 640, height = 480;
  let stream;
  let canvas;
  let ctx;

  let myIncomingClassifier = [];
  let myGroups = [];
  let training = -1;

  export default {
    data: () => ({
      toggle: false,
      local: false,
      customd:[],
    }),
    methods: {
      clearClass (event, index) {
        // console.log("clear" + index);
        knn.clearClass(index);
        this.customd[index].count = 0;
      },
      trainClass (event, index) {
        // console.log("train" + index);
        training = index;
      },
      updateCount (index) {
        const exampleCount = knn.getClassExampleCount();
        this.customd[index].count = exampleCount[index];
        console.log(this.customd[index].count);
      },
      save () {
        saveModel(this.userUid);
        let db = this.$db.requireDB();
        let uid = store.state.user.uid;
        db.collection('users').doc(uid).collection('model').doc('map').update({
          customd: this.customd
        });
        // chrome.runtime.sendMessage(
        //   {
        //     data:"saveModel",
        //     uidm: this.userUid
        //   },
        //   (response)=>{
        //     console.log(response);
        //   }
        // );
      },
      logout (){
            this.$auth.logout();
            this.$router.replace({name: 'login'})
        }
    },
    props: {
      source: String
    },
    computed: {
      ...mapState(['user']),
      userUid () {
        return !!this.user ? this.user.uid : ''
      },
      userName (){
        return !!this.user ? this.user.displayName : ''
      }
    },
    async mounted(){
      //loading database
      let db = this.$db.requireDB();
      let uid = store.state.user.uid;
      db.collection('users').doc(uid).collection('model').doc('map').get().then(
        (doc)=>{
          if(doc.exists){
            this.customd = doc.data().customd;
          }
          else{
            db.collection('users').doc(uid).collection('model').doc('map').set({
              defaults:[null,null,null,null,null,null],
              customs:[null,null,null,null,null,null],
              customd:[
                {Description:"Pose 1", id: 1, count: 0},
                {Description:"Pose 2", id: 2, count: 0},
                {Description:"Pose 3", id: 3, count: 0},
                {Description:"Pose 4", id: 4, count: 0},
                {Description:"Pose 5", id: 5, count: 0},
                {Description:"Pose 6", id: 6, count: 0}
              ],
            });
            this.customd = [
              {Description:"Pose 1", id: 1, count: 0},
              {Description:"Pose 2", id: 2, count: 0},
              {Description:"Pose 3", id: 3, count: 0},
              {Description:"Pose 4", id: 4, count: 0},
              {Description:"Pose 5", id: 5, count: 0},
              {Description:"Pose 6", id: 6, count: 0}
            ];
          }
        }
      );
      //loading canvas & model
      try{
          video = await loadVideo();
      }
      catch(e){
          throw e;
      }
      canvas = document.getElementById('output');
      ctx = canvas.getContext('2d');
      net = await posenet.load(1.01);
      knn = knnClassifier.create();
      mobilenet = await mobilenetModule.load();
      await loadModel();
      detectPose(video,net);
      
      for(let i=0; i<6; i++){
        const count = knn.getClassExampleCount();
        this.customd[i].count = count[i];
      }

      chrome.runtime.sendMessage(
        {
          data:"login",
          uidm: uid
        },
        (response)=>{
          this.toggle = response.customm;
          this.local = response.localm;
        }
      );
    },
    beforeDestroy(){
      net.dispose();
      knn.dispose();
      video.pause();
      video.srcObject = null;
      stream.getTracks().forEach((track) => {
          track.stop();
      });
    }
  }

  async function loadVideo(){
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
    }
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    let video = document.createElement('video');
    video.height = height;
    video.width = width;
    video.srcObject = stream;
    video.play();
    return video;
  }

  function detectPose(video,net){
      
      async function detect(){
          const pose = await net.estimateSinglePose(video,0.3,true,16);
          ctx.clearRect(0,0,width,height);
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-width, 0);
          ctx.drawImage(video,0,0,width,height);
          ctx.restore();
          if (pose.score >= 0.1) {
            utils.drawKeypoints(pose.keypoints, 0.3, ctx);
            utils.drawSkeleton(pose.keypoints, 0.3, ctx);
          }
          const image = tf.fromPixels(canvas);
          tf.disableDeprecationWarnings();
          let logits;
          const infer = () => mobilenet.infer(image, 'conv_preds');
          if (training != -1) {
            logits = infer();
            knn.addExample(logits, training);
            const exampleCount = knn.getClassExampleCount();
          }
          image.dispose();
          if (logits != null) {
            logits.dispose();
          }
          requestAnimationFrame(detect);
      }
      detect();
  }

  //save and load model
  async function defineClassifierModel(myPassedClassifier){
    let myLayerList = [];
    myLayerList[0] = [];    // for the input layer name as a string
    myLayerList[1] = [];    // for the input layer
    myLayerList[2] = [];    // for the concatenate layer name as a string
    myLayerList[3] = [];    // for the concatenate layer
                                                         
    let myMaxClasses = myPassedClassifier.getNumClasses();                                 
    for (let myClassifierLoop = 0; myClassifierLoop < myMaxClasses; myClassifierLoop++){
      myLayerList[0][myClassifierLoop] = 'myInput'  + myClassifierLoop;
      myLayerList[1][myClassifierLoop] = tf.input({shape: myPassedClassifier.getClassifierDataset()[myClassifierLoop].shape[0], name: myLayerList[1][myClassifierLoop]});
      myLayerList[2][myClassifierLoop] = 'myInput'+myClassifierLoop+'Dense1';
      myLayerList[3][myClassifierLoop] = tf.layers.dense({units: 1000, name: myGroups[myClassifierLoop]}).apply(myLayerList[1][myClassifierLoop]);
    }
                                           
    const myConcatenate1 = tf.layers.concatenate({axis : 1, name: 'myConcatenate1'}).apply(myLayerList[3]);
    const myConcatenate1Dense4 = tf.layers.dense({units: 1, name: 'myConcatenate1Dense4'}).apply(myConcatenate1);

    const myClassifierModel = tf.model({inputs: myLayerList[1], outputs: myConcatenate1Dense4});                                                         
    myClassifierModel.summary();
    myPassedClassifier.getClassifierDataset()[0].print(true);

    for (let myClassifierLoop = 0; myClassifierLoop < myMaxClasses; myClassifierLoop++ ){
      const myInWeight = await myPassedClassifier.getClassifierDataset()[myClassifierLoop];
      myClassifierModel.layers[myClassifierLoop + myMaxClasses].setWeights([myInWeight, tf.ones([1000])]);
    }
    return myClassifierModel;
  }

  async function saveModel(uid){
    const myClassifierModel2 = await defineClassifierModel(knn);
    myClassifierModel2.save('indexeddb://'+ uid);
    console.log('Classifier saved');
  }

  async function loadModel(){
    const myLoadedModel  = await tf.loadModel('https://ujoy7851.github.io/Capstone/model/model.json');
    // const myLoadedModel  = await tf.loadModel('indexeddb://model');

    const myMaxLayers = myLoadedModel.layers.length;
    const myDenseEnd =  myMaxLayers - 2;
    const myDenseStart = myDenseEnd/2;                                  
    for (let myWeightLoop = myDenseStart; myWeightLoop < myDenseEnd; myWeightLoop++ ){
        myIncomingClassifier[myWeightLoop - myDenseStart] = myLoadedModel.layers[myWeightLoop].getWeights()[0];
        myGroups[myWeightLoop - myDenseStart] = myLoadedModel.layers[myWeightLoop].name 
    }
    knn.dispose()
    knn.setClassifierDataset(myIncomingClassifier);
    console.log('Classifier loaded');
  }

</script>

<style lang="stylus">
  
</style>