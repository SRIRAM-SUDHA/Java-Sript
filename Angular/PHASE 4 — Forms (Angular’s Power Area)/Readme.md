# PHASE 4 - Forms (Angular's Power Area)

## Goal
Become genuinely strong with **Reactive Forms** (enterprise default), including typed forms (Angular 14), custom validators, async validators, dynamic forms with `FormArray`, and production-grade error display patterns.

## Topics
1. **Template-Driven Forms (Quick)**
   - Basic understanding only
   - When NOT to use them
2. **Reactive Forms (Critical)**
   - `FormGroup`, `FormControl`, `FormBuilder`
   - Validators (sync + async)
   - `FormArray` + dynamic forms
   - Form state management patterns

---

## 1) Template-Driven Forms (Quick)

### Concepts
- Template-driven forms use directives like `ngModel` to create the form model implicitly from the template.
- You primarily work in HTML, with Angular building `FormControl`s behind the scenes.

📖 **Plain-English definition**: You write a plain HTML form and sprinkle `ngModel` on the inputs; Angular quietly builds the `FormControl`/`FormGroup` objects for you in the background, so you never see or touch the form model directly.

### ⚛️ How This Works in React (Your Mental Anchor)
There's no real "two-way binding" primitive in React/JSX — `[(ngModel)]` doesn't have a direct equivalent; you always write the `onChange` handler yourself. The closest React pattern is a plain controlled input with `useState` per field:
```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button disabled={!email}>Save</button>
    </form>
  );
}
```
`[(ngModel)]="email"` is genuinely just sugar for `[ngModel]` (value in) + `(ngModelChange)` (value out) — exactly the `value={email}` / `onChange={...}` pair you write by hand in React. Angular's version *feels* like magic two-way binding, but it's the same two halves; Angular just wires them together via one directive, whereas React makes you spell out the `onChange` explicitly every time. Uncontrolled inputs + `useRef` (React's other pattern) map more loosely to "let the DOM hold the value," but template-driven forms are still building a real `FormControl` model behind the scenes, so a controlled `useState` input is the more honest comparison.

🧪 **SDET / Test Automation Angle**: The DOM stays close to a "normal" HTML form (named inputs, native validation attributes like `required`/`email`), which often makes basic form-filling automation simpler — locate by `name`/label, type a value, submit. The trade-off for testers: validation state lives on directive instances (`NgModel`, `NgForm`) rather than a component-class object you can inspect directly, so asserting *why* a field is invalid, or asserting intermediate `PENDING`/`dirty` state precisely, is more awkward than with reactive forms. If a suite needs to assert fine-grained validation state, that's a signal the app (or at least that form) is a better fit for reactive forms.

### Why it exists ✅
- ⚡ Fast for small/simple forms.

### How Angular uses it internally 🔍
- `FormsModule` directives register controls with a parent `NgForm`.
- The model is built at runtime based on DOM + directives (less explicit, harder to unit test).
- Concretely: the `NgModel` directive itself implements `ControlValueAccessor` and internally creates a `FormControl`, then calls `formGroup.addControl(name, control)` (on the implicit root `NgForm`, exported as `#f="ngForm"`) once Angular's change detection stabilizes after the view is created — this is why a freshly-added `ngModel` control isn't always available on the very first change-detection tick (the classic "ExpressionChangedAfterItHasBeenCheckedError" trap with template-driven forms). Two-way binding (`[(ngModel)]`) is just syntax sugar over `[ngModel]` (input) + `(ngModelChange)` (output), both wired through that same directive.

### Example
```html
<form #f="ngForm" (ngSubmit)="save()">
  <input name="email" [(ngModel)]="email" required email />
  <button [disabled]="f.invalid">Save</button>
</form>
```

### ✅ Best Practices
- Use template-driven forms only for small forms with simple validation.

### ❌ Avoid
- Complex dynamic forms, cross-field validation, and advanced async validation using template-driven style.

### 🎯 Interview insight
- "Reactive forms scale better because the form model is explicit and testable."

### 🔄 SDLC Angle
Template-driven forms show up almost entirely at **implementation** time, for genuinely small forms (a login box, a single settings toggle) — it's rarely a deliberate design-phase architecture decision, more a "this is too small to justify a form model" call made while building. At **code review**, the flag to watch for is scope creep: a template-driven form that's grown cross-field validation or dynamic fields is a sign it should have been (or should now be) migrated to reactive forms. It rarely causes **production** incidents on its own, but it does make **maintenance** harder later — because validation state lives on directive instances rather than a component-class object, debugging or extending it months later takes longer than the reactive-forms equivalent would have.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "When would you actually reach for template-driven forms instead of reactive forms on a real project?"
- **Strong answer:** Only for small, simple forms with basic validation — a quick settings form or a one-off input — where building an explicit `FormGroup` model would be overkill. Angular still builds `FormControl`s under the hood via `NgModel`, you just don't see or touch that model directly, which is fine for something this size but doesn't scale to cross-field validation or dynamic fields.
- **Level-up:** A junior answer says "it's simpler to write." A senior answer adds the cost side: validation state is harder to unit-test since it lives on directive instances (`NgModel`/`NgForm`) rather than a plain object, and knows the `ExpressionChangedAfterItHasBeenCheckedError` trap where a freshly-added `ngModel` control isn't registered on the first change-detection tick.

---

## 2) Reactive Forms (Critical)

### Concepts
- Reactive forms are model-first:
  - you construct the form model in TS (`FormGroup`, `FormControl`, `FormArray`)
  - template binds to it (`[formGroup]`, `formControlName`, `formArrayName`)
- Control state:
  - `value`, `status` (`VALID`/`INVALID`/`PENDING`), `errors`
  - `touched`, `dirty`, `pristine`
  - `valueChanges` and `statusChanges`

📖 **Plain-English definition**: Reactive forms flip the order of template-driven forms: you build the form as a tree of plain JavaScript/TypeScript objects (`FormGroup`, `FormControl`, `FormArray`) in your component class *first*, and the HTML template just binds to that already-existing object — the template never creates the model, it only displays and edits it.

### ⚛️ How This Works in React (Your Mental Anchor)
This maps well onto a form *library*, not onto raw React — if you already know `react-hook-form` or Formik, reactive forms will feel very familiar:

| Angular Reactive Forms | react-hook-form |
|---|---|
| `FormGroup` | the object returned by `useForm()` |
| `FormControl` | one registered field (`register('email')`) |
| `Validators.required` | a validation rule (built-in, or a Yup/Zod schema rule) |
| `valueChanges` (Observable) | `watch()` |
| `form.value` / `getRawValue()` | `getValues()` |
| `form.invalid` / `control.errors` | `formState.errors` |

```jsx
// react-hook-form + Yup, doing the same job as the Angular login form below
const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(8),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register('password')} />
      <button type="submit">Save</button>
    </form>
  );
}
```
The philosophical difference: Angular ships the form-state engine (`FormGroup`/`FormControl`) as a first-party framework API — you build the model straight from `@angular/forms` primitives. React has no built-in equivalent at all; `useState` per field doesn't scale to cross-field validation, dynamic fields, or async validation, which is exactly why the ecosystem converged on `react-hook-form`/Formik as React's de facto "reactive forms." `ControlValueAccessor` (wiring a custom component into the form model) maps to a custom `Controller`/`register` integration in react-hook-form for a component that doesn't expose a plain `<input>`-shaped `onChange`/`value` API.

🧪 **SDET / Test Automation Angle**: This is one of the most directly test-relevant Angular topics. A field's `valid`/`invalid`/`touched`/`dirty` state is exactly what drives whether a submit button is `[disabled]`, whether an error message shows, and it's exactly what an E2E or component test asserts on (`expect(submitButton).toBeDisabled()`, `expect(field.classList).toContain('ng-invalid')`, etc.). A subtlety that trips up automated tests: filling a field and immediately clicking submit can behave differently than a real user, because many validators (and CSS classes like `ng-touched`) only activate after a **blur** event, not just after a value changes. A test that sets a value via `element.value = 'x'` and dispatches only an `input` event may see different validity/CSS state than a real user who tabs or clicks away first — so tests should dispatch the same event sequence a user would (`input` then `blur`) rather than only programmatically setting the control's value. Custom validators (below) are also worth knowing: they attach a stable **error key** (e.g., `{ usernameTaken: true }`) to `control.errors`, which is a much sturdier thing for a test to assert on than the rendered error text — hardcoded error-message strings break the moment copy changes, whereas asserting on the error code or the `ng-invalid`/`ng-valid` CSS state survives copy edits.

### Why it exists ✅
- 🧠 Explicit state machine for complex forms.
- 🧪 Easy unit testing without rendering a UI.
- 🧩 Dynamic fields (`FormArray`) and predictable validation.

### How Angular uses it internally (ControlValueAccessor) 🧠
The bridge between DOM and form model is **ControlValueAccessor (CVA)**.
- For native inputs, Angular ships CVAs.
- For custom components (`<app-date-picker>`), you implement CVA so it behaves like a form control.

> 🔍 This is the answer to "how does Angular connect an `<input>` to a `FormControl`?"

Concretely, a `FormControl` instance is a small state container holding three things: its current `value`, its current `status` (`VALID` / `INVALID` / `PENDING` / `DISABLED`), and the list of sync + async validator functions it was given. `valueChanges` and `statusChanges` are plain RxJS `Observable`s (backed by `EventEmitter`s internally) that the control emits on whenever `setValue`/`patchValue` runs or the DOM fires a change through its `ControlValueAccessor`'s `registerOnChange` callback. Calling `updateValueAndValidity()` (which Angular triggers automatically on most changes) re-runs the validators, recomputes `status`, and — importantly — **cascades upward**: a child control's status change re-triggers validity recomputation on its parent `FormGroup`/`FormArray` too, which is how a single invalid nested field makes the whole top-level form `invalid` without you wiring that up manually.

### Setup
`app.module.ts`:
```ts
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({ imports: [ReactiveFormsModule] })
export class AppModule {}
```

---

### Typed forms (Angular 14) ✅
Typed forms reduce runtime mistakes and eliminate many `as any` casts.

### ⚛️ How This Works in React (Your Mental Anchor)
The React equivalent of "typed form values" isn't a forms feature at all — it's typing your validation schema and inferring the form's TypeScript type from it. With Zod:
```ts
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type LoginForm = z.infer<typeof loginSchema>; // { email: string; password: string }

const { register, handleSubmit } = useForm<LoginForm>({
  resolver: zodResolver(loginSchema),
});
```
(Yup's `yup.InferType<typeof schema>` does the same job if that's your schema library.) Same goal as Angular's `FormGroup<{ email: FormControl<string>; ... }>` below — compile-time safety on the form's shape, no more `as any` casts on `.value`/`.get()` — but a different mechanism: Angular types the form-control tree itself, while React/react-hook-form types the *values object* and derives everything (what `register()` and `watch()` are allowed to return) from that one schema type.

`login-form.component.ts`:
```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({ selector: 'app-login-form', templateUrl: './login-form.component.html' })
export class LoginFormComponent {
  form: LoginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    // call facade/service
  }
}
```

---

### Validators (sync)

#### Concepts
- Validators are pure functions that return `ValidationErrors | null`.
- Cross-field validators attach to a `FormGroup`.

#### Example: password match (cross-field)
```ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}
```

Use:
```ts
this.form = this.fb.group(
  { password: ['', Validators.required], confirm: ['', Validators.required] },
  { validators: [passwordsMatch] }
);
```

---

### Validators (async)

#### Concepts
- Async validators return `Observable<ValidationErrors | null>`.
- Control becomes `PENDING` while async validator runs.

#### Example: username availability
```ts
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export function usernameAvailable(api: { check: (u: string) => Observable<boolean> }): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const username = String(control.value ?? '').trim();
    if (!username) return of(null);
    return api.check(username).pipe(
      map((available) => (available ? null : { usernameTaken: true })),
      catchError(() => of(null))
    );
  };
}
```

✅ Best practice: combine with `updateOn: 'blur'` for expensive validators:
```ts
new FormControl('', { nonNullable: true, updateOn: 'blur', asyncValidators: [usernameAvailable(api)] })
```

---

### Dynamic forms with `FormArray` (production pattern)

#### Concepts
- `FormArray` is the correct tool for lists of controls/groups: skills, addresses, phone numbers.

#### Example: skills list
```ts
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

type SkillsForm = FormGroup<{
  name: FormControl<string>;
  skills: FormArray<FormControl<string>>;
}>;

@Component({ selector: 'app-skills-editor', templateUrl: './skills-editor.component.html' })
export class SkillsEditorComponent {
  form: SkillsForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    skills: new FormArray<FormControl<string>>([]),
  });

  get skills(): FormArray<FormControl<string>> {
    return this.form.controls.skills;
  }

  addSkill(): void {
    this.skills.push(new FormControl('', { nonNullable: true, validators: [Validators.required] }));
  }

  removeSkill(i: number): void {
    this.skills.removeAt(i);
  }
}
```

`skills-editor.component.html`:
```html
<form [formGroup]="form">
  <input formControlName="name" placeholder="Name" />

  <div formArrayName="skills">
    <button type="button" (click)="addSkill()">+ Add skill</button>

    <div *ngFor="let ctrl of skills.controls; let i = index">
      <input [formControlName]="i" placeholder="Skill" />
      <button type="button" (click)="removeSkill(i)">Remove</button>
      <small *ngIf="ctrl.touched && ctrl.invalid">Skill is required</small>
    </div>
  </div>
</form>
```

---

### Error display: a clean, repeatable pattern ✅
You want errors to show at the right time:
- after field touched, OR
- after submit attempt

Simple pattern:
```ts
submitted = false;
submit(): void {
  this.submitted = true;
  if (this.form.invalid) return;
}
showError(ctrl: { invalid: boolean; touched: boolean }): boolean {
  return ctrl.invalid && (ctrl.touched || this.submitted);
}
```

### ✅ Best Practices
- Default to reactive forms for production apps.
- Use typed forms (Angular 14) to eliminate a class of bugs.
- Keep form-to-API mapping explicit (map to DTO; don't send raw form object blindly).
- Use `patchValue` for partial updates; reserve `setValue` for full shapes.
- Use `markAllAsTouched()` on submit when you want all errors visible.

### ❌ Avoid
- Mixing template-driven (`ngModel`) with reactive forms in the same form.
- Subscribing to `valueChanges` everywhere without cleanup or without a clear reason.
- Updating the same control inside its `valueChanges` without guard (infinite loop).

### Common mistakes 🧯
- Control stuck `PENDING`: async validator observable never completes.
- `setValue` throws: you forgot a field. Use `patchValue` for partial updates.
- Disabled controls missing from `form.value`: use `getRawValue()` if you need them.

### 🎯 Interview insights
- Explain CVA (how custom components integrate with forms).
- Explain cross-field validation (group validator) and async validation (PENDING status).
- Mention typed forms as Angular 14 feature.

### 🔄 SDLC Angle
Reactive forms decisions span more of the lifecycle than most topics here. The choice to model a form explicitly (and how to shape `FormArray`s for dynamic data) is a **design-phase** call once the data shape is known. The bulk of the work — `FormGroup`/`FormControl` wiring, validators, CVA for custom controls — is **implementation**, but it's also where **code review** earns its keep: is validation logic consistent across the team (shared validator functions vs. copy-pasted regex), is `getRawValue()` used where disabled controls matter, is the form-to-API mapping explicit rather than sending the raw form object. Async validators tied to `updateOn: 'blur'` are a **design-time performance decision** (don't hit the backend on every keystroke). And validator bugs are a classic **production/maintenance** category — a slightly-wrong regex or an async validator observable that never completes silently leaves a control stuck `PENDING`, which looks like a frozen submit button to a user and a confusing bug report to whoever's on call.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How does Angular connect a custom component (like a date picker) to a `FormGroup`, and what's a subtle bug that can happen with async validators?"
- **Strong answer:** Through `ControlValueAccessor` — the custom component implements `writeValue`, `registerOnChange`, and `registerOnBlur` so the form model can push values in and receive updates out, exactly like Angular's built-in CVAs do for native inputs. A subtle async-validator bug: if the validator's observable never completes (e.g., a `Subject` with no terminal value, or an unhandled error that isn't funneled through `catchError`), the control's status stays `PENDING` forever, which blocks the whole form from ever becoming valid — often surfacing in production as "the submit button never enables."
- **Level-up:** A junior answer stops at "CVA connects custom components to forms." A senior answer adds that validity recomputation cascades upward — a single invalid nested control makes the parent `FormGroup`/`FormArray` invalid automatically via `updateValueAndValidity()` — and knows typed forms (Angular 14) catch a class of these wiring mistakes at compile time by eliminating `as any` casts on `.value`/`.get()`.

---

## Hands-on (Do This)
- Build a multi-step "Profile Editor" form:
  - Cross-field validation (password match, date range, etc.)
  - Dynamic add/remove controls (`FormArray`)
  - 1 async validator (username/email availability)
  - Error display pattern that does not spam errors before the user interacts

## Exit Criteria
- You can build non-trivial forms without brittle template logic.
- You can explain CVA, group validators, async validators, and form arrays confidently.

## Next
- Continue to `../PHASE 5 — HTTP, APIs, and Side Effects/Readme.md`

