//
// Sorteo Component - Form handling and Firebase integration
// ================================================================================

export function initSorteoComponent() {
    const sorteoElements = document.querySelectorAll('.c-sorteo');
    
    sorteoElements.forEach(element => {
        const sorteoId = element.id;
        if (!sorteoId) return;
        
        // Check if already initialized
        if (element.dataset.sorteoInitialized === 'true') return;
        element.dataset.sorteoInitialized = 'true';
        
        // More link handler
        const moreLink = element.querySelector(`#sorteo-moreLink-${sorteoId}`);
        if (moreLink && !moreLink.dataset.listenerAdded) {
            moreLink.dataset.listenerAdded = 'true';
            moreLink.addEventListener('click', function(event) {
                event.preventDefault();
                const moreText = element.querySelector(`#sorteo-moreText-${sorteoId}`);
                if (moreText) {
                    const moreContent = moreText.querySelector('.more-content');
                    if (moreContent) {
                        moreContent.style.display = 'inline';
                    }
                }
                this.style.display = 'none';
            });
        }
        
        // Firebase initialization (only if not already initialized)
        if (!window.sorteoFirebaseInitialized) {
            window.sorteoFirebaseInitialized = true;
            
            import('https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js').then(({ getAuth, signInAnonymously }) => {
                import("https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js").then(({ initializeApp }) => {
                    import("https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js").then(({ getAnalytics }) => {
                        import("https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js").then(({ getFirestore, collection, addDoc }) => {
                            
                            const firebaseConfig = {
                                apiKey: "",
                                authDomain: "sorteo-barcodelamor.firebaseapp.com",
                                projectId: "sorteo-barcodelamor",
                                storageBucket: "sorteo-barcodelamor.appspot.com",
                                messagingSenderId: "1064733880196",
                                appId: "1:1064733880196:web:323d583ebec3754edbf7d1",
                                measurementId: "G-ZPE2YE459L"
                            };

                            const app = initializeApp(firebaseConfig);
                            const analytics = getAnalytics(app);
                            window.sorteoAuth = getAuth(app);
                            window.sorteoDb = getFirestore(app);
                            
                            signInAnonymously(window.sorteoAuth)
                                .then((result) => {
                                    console.log('Signed in anonymously with UID:', result.user.uid);
                                    window.sorteoUserId = result.user.uid;
                                })
                                .catch((error) => {
                                    console.error('Error signing in anonymously:', error);
                                });
                            
                            // Initialize forms for all sorteo elements
                            initAllSorteoForms({ getFirestore, collection, addDoc });
                        });
                    });
                });
            });
        } else {
            // Firebase already initialized, just set up forms
            setTimeout(() => {
                initAllSorteoForms();
            }, 100);
        }
    });
}

function initAllSorteoForms(firebaseModules = null) {
    const sorteoElements = document.querySelectorAll('.c-sorteo');
    
    sorteoElements.forEach(element => {
        const sorteoId = element.id;
        if (!sorteoId) return;
        
        const formId = `sorteo-form-${sorteoId}`;
        const form = element.querySelector(`#${formId}`);
        if (form && !form.dataset.listenerAdded) {
            form.dataset.listenerAdded = 'true';
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                console.log("Form submitted for", sorteoId);

                const name = element.querySelector(`#sorteo-name-${sorteoId}`)?.value;
                const surname = element.querySelector(`#sorteo-surname-${sorteoId}`)?.value;
                const secondSurname = element.querySelector(`#sorteo-secondSurname-${sorteoId}`)?.value;
                const email = element.querySelector(`#sorteo-email-${sorteoId}`)?.value;
                const tlf = element.querySelector(`#sorteo-tlf-${sorteoId}`)?.value;
                const province = element.querySelector(`#sorteo-province-${sorteoId}`)?.value;

                console.log(name, surname, secondSurname, email, tlf, province);

                if (firebaseModules && window.sorteoDb && window.sorteoUserId) {
                    const { collection, addDoc } = firebaseModules;
                    try {
                        await addDoc(collection(window.sorteoDb, "sorteo-barco-del-amor"), {
                            userId: window.sorteoUserId,
                            nombre: name,
                            primer_apellido: surname,
                            segundo_apellido: secondSurname,
                            email: email,
                            telefono: tlf,
                            provincia: province,
                        });

                        form.reset();
                        alert("Datos guardados exitosamente.");
                    } catch (error) {
                        console.error("Error al guardar los datos: ", error);
                    }
                } else if (window.sorteoDb && window.sorteoUserId) {
                    // Use global firebase if modules not passed
                    import("https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js").then(({ collection, addDoc }) => {
                        addDoc(collection(window.sorteoDb, "sorteo-barco-del-amor"), {
                            userId: window.sorteoUserId,
                            nombre: name,
                            primer_apellido: surname,
                            segundo_apellido: secondSurname,
                            email: email,
                            telefono: tlf,
                            provincia: province,
                        }).then(() => {
                            form.reset();
                            alert("Datos guardados exitosamente.");
                        }).catch((error) => {
                            console.error("Error al guardar los datos: ", error);
                        });
                    });
                }
            });
        }
    });
}


