#include <bits/stdc++.h>
using namespace std;

bool valid[1000005];

int main() {
    for (int i = 0; i <= 1000000; i++) valid[i] = false;
    for (long long k = 2; k <= 1000; k++) {
        long long sum = 1 + k + k * k;
        long long val = k * k;
        while (sum <= 1000000) {
            valid[sum] = true;
            val *= k;
            sum += val;
        }
    }
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        if (valid[n]) cout << "YES" << endl;
        else cout << "NO" << endl;
    }
    return 0;
}
