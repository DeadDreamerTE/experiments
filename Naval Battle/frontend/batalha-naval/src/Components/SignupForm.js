import { useEffect, useState } from 'react';
import styles from './SignupForm.module.css'

function useSignupForm() {
    const [fields, setFields] = useState({
        user: "",
        email: '',
        password: '',
        passwordConfirmation: '',
        acceptsTerms: false,
        acceptsCommunications: false
    })

    const [errors, setErrors] = useState({})

    useEffect(() => {
        let userError = undefined
        if (fields.user.length === 0) {
            userError = "Por favor introduza o seu username."
        }

        setErrors(err => ({
            ...err,
            user: userError
        }))
    }, [fields.user])
    useEffect(() => {
        // console.log(fields)

        let emailError = undefined
        if (fields.email.length === 0) {
            emailError = "Por favor introduza o seu endereço de email."
        } else if (!validateEmail(fields.email)) {
            emailError = "Por favor introduza um endereço de email válido."
        }

        setErrors(err => ({
            ...err,
            email: emailError
        }))
    }, [fields.email])
    useEffect(() => {
        // console.log(fields)
        // Validação da Password
        const passwordStrength = checkPasswordStrength(fields.password)
        let passwordError = undefined
        if (fields.password.length === 0) {
            passwordError = "Por favor introduza a sua password."
        } else if (passwordStrength === 0) {
            passwordError = "A sua password deve ter no mínimo 8 caracteres."
        } else if (passwordStrength < 4) {
            passwordError = "A sua password deve ter pelo menos um número, uma mínuscula, uma maiúscula e um símbolo."
        }

        let passwordConfirmationError = undefined
        if (fields.passwordConfirmation.length === 0) {
            passwordConfirmationError = "Por favor introduza novamente a sua password."
        } else if (fields.password !== fields.passwordConfirmation) {
            passwordConfirmationError = "As passwords não coincidem."
        }

        setErrors(err => ({
            ...err,
            password: passwordError,
            passwordConfirmation: passwordConfirmationError
        }))

        // Validação da Confirmação da Password
    }, [fields.password, fields.passwordConfirmation])
    useEffect(() => {
        // console.log(fields)
        // Validação da aceitação dos Termos
        let acceptsTermsError = undefined
        if (!fields.acceptsTerms) {
            acceptsTermsError = "Tem de aceitar os termos e condições para criar a sua conta."
        }

        setErrors(err => ({
            ...err,
            acceptsTerms: acceptsTermsError
        }))
    }, [fields.acceptsTerms])

    return [fields, setFields, errors]
}

export default function SignupForm() {
    const [fields, setFields, errors] = useSignupForm()

    async function handleSubmit(e) {
        e.preventDefault()
        const existingErrors = Object.keys(errors).map(key => errors[key]).filter(v => v !== undefined);
        if (existingErrors.length === 0) {
            const result = await fetch("/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...fields, email: fields.email.toLowerCase() })
            })
            const json = await result.json()
            if (result.status === 201) {
                alert(json.message)
                window.location.pathname = "/login"
            } else {
                alert(JSON.stringify(json.errors))
            }
        }
    }
    return (
        <form className={styles.form} onSubmit={(e) => handleSubmit(e)}>
            <h2>Sign Up:</h2>
            <TextInput
                label="Introduza o seu username"
                name="user"
                fields={fields}
                setFields={setFields} />

            <TextInput
                label="Introduza o seu email"
                name="email"
                fields={fields}
                setFields={setFields} />

            <PasswordInput
                label="Introduza a sua password"
                name="password"
                showStrength
                fields={fields}
                errors={errors}
                setFields={setFields} />

            <PasswordInput
                label="Introduza novamente a sua password"
                name="passwordConfirmation"
                fields={fields}
                setFields={setFields} />

            <CheckboxInput
                label="Li e aceito os Termos e Condições."
                name="acceptsTerms"
                fields={fields}
                setFields={setFields} />

            <CheckboxInput
                label="Aceito receber comunicações"
                name="acceptsCommunications"
                fields={fields}
                setFields={setFields} />

            <button type="submit">
                Submeter
            </button>
            <Error errors={errors} string="user" />
            <Error errors={errors} string="email" />
            <Error errors={errors} string="password" />
            <Error errors={errors} string="passwordConfirmation" />
            <Error errors={errors} string="acceptsTerms" />

        </form>
    )
}

function TextInput({ fields, setFields, name, label, type = "text" }) {
    return (
        <div className={styles.input}>
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                type={type}
                value={fields[name]}
                onChange={(e) => setFields(f => ({
                    ...f,
                    [name]: e.target.value
                }))} />

        </div>
    )
}

function strengthToClassName(strength) {
    const colors = [
        "zero",
        "one",
        "two",
        "three",
        "four"
    ]
    return colors[strength]
}

function PasswordStrengthIndicator({ value }) {
    return (
        <div className={styles.passwordIndicator}>
            <span className={styles.number}>{value}</span>
            <div
                className={[styles.bar]
                    .concat(styles[strengthToClassName(value)])
                    .join(' ')}
            // style={{
            //     transform: `scaleX(${value / 4})`,
            //     backgroundColor: strengthToColor(value)
            // }}
            />
        </div>
    )
}

function PasswordInput({ fields, setFields, name, label, showStrength }) {
    const [visible, setVisible] = useState(false)
    return (
        <div>
            <div className={styles.input}>
                <label htmlFor={name}>{label}</label>
                <div>
                    <input style={{ width: "76.75%" }}
                        id={name}
                        type={visible ? "text" : "password"}
                        value={fields[name]}
                        onChange={(e) => setFields(f => ({
                            ...f,
                            [name]: e.target.value
                        }))} />
                    <button style={{ marginLeft: "5px", width: "20%", height: "27px" }} type="button" onClick={() => setVisible(v => !v)}>
                        {visible ? 'Ocultar' : 'Mostrar'}
                    </button>
                </div>
            </div>
            {showStrength && (
                <PasswordStrengthIndicator
                    value={checkPasswordStrength(fields[name])} />
            )}

        </div>
    )
}

function CheckboxInput({ fields, setFields, name, label, errors }) {
    return (
        <div className={styles.checkbox}>
            <input
                id={name}
                type="checkbox"
                checked={fields[name]}
                onChange={(e) => setFields(f => ({
                    ...f,
                    [name]: e.target.checked
                }))} />
            <div className={styles.checkboxtext}><label htmlFor={name}>{label}</label>
                {
                    errors && errors[name] !== undefined && (
                        <span className={styles.error}>
                            {errors[name]}
                        </span>
                    )
                }</div>
        </div>
    )
}

function validateEmail(email) {
    // Esta expressão regular não garante que email existe, nem que é válido
    // No entanto deverá funcionar para a maior parte dos emails que seja necessário validar.
    const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return EMAIL_REGEX.test(email)
}

function checkPasswordStrength(password) {
    if (password.length < 8) return 0;
    const regexes = [
        /[a-z]/,
        /[A-Z]/,
        /[0-9]/,
        /[~!@#$%^&*)(+=._-]/
    ]
    return regexes
        .map(re => re.test(password))
        .reduce((score, t) => t ? score + 1 : score, 0)
}

function Error({ errors, string }) {
    return (
        <>
            {errors[string] !== undefined && (
                <span className={styles.error}>
                    {errors[string]}
                </span>)
            }</>)
}