pipeline {
    agent any
    
    tools {nodejs "nodejs"}
    
    stages {
        stage("init") {
            steps {
                echo '=====Init====='
                sh 'npm install' 
            }
        }
        stage("build") {
            steps {
                echo '=====Building app====='
            }
        }
        stage("test") {
            steps {
                echo '=====Testing app====='
                sh 'npm run test' 
            }
        }
        stage("deploy") {
            steps {
                echo '=====Deploying app====='
            }
        }
    }   
}
