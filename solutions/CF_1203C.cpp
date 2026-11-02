#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long a[n];
    for (int i = 0; i < n; i++) cin >> a[i];
    long long g = a[0];
    for (int i = 1; i < n; i++) g = std::gcd(g, a[i]);
    long long ans = 0;
    for (long long i = 1; i * i <= g; i++) {
        if (g % i == 0) {
            ans++;
            if (i * i != g) ans++;
        }
    }
    cout << ans << endl;
    return 0;
}
