pipeline {
    agent any
    stages {
        stage("init") {
            steps {
                echo '=====Init====='
            }
        }
        stage("build") {
            steps {
                echo '=====Building app====='
                sh 'npm install' 
            }
        }
        stage("test") {
            steps {
                echo '=====Testing app====='
            }
        }
        stage("deploy") {
            steps {
                echo '=====Deploying app====='
            }
        }
    }   
}
